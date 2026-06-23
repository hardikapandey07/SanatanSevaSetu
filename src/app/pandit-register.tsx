import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MessageModal } from '@/components/message-modal';
import { Spacing } from '@/constants/theme';
import { ApiService, TokenManager, type ExtraField, type SpecialityTree, type PanditReference } from '@/constants/api';
import { useT } from '@/i18n/LanguageContext';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  noteBg: '#FFF1DE',
  noteBorder: '#F5D9A8',
  required: '#DC2626',
  inputBorder: '#E5DCC8',
  chipBg: '#FFF1DE',
  chipText: '#C95A0E',
};

const EXPERIENCE_OPTIONS = ['0-5 Years', '5-10 Years', '10-15 Years', '15-20 Years', '20+ Years'];

export default function PanditRegisterScreen() {
  const t = useT();

  // API-loaded options
  const [languages, setLanguages] = useState<ExtraField[]>([]);
  const [specialityTree, setSpecialityTree] = useState<SpecialityTree[]>([]);
  const [references, setReferences] = useState<PanditReference[]>([]);

  // Form state
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);
  const [selectedSpecialityIds, setSelectedSpecialityIds] = useState<string[]>([]);
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [pin, setPin] = useState('');
  const [experience, setExperience] = useState('');
  const [numPandits, setNumPandits] = useState('');
  const [refCode, setRefCode] = useState('');
  const [aadharFile, setAadharFile] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      ApiService.getExtraFields(2),
      ApiService.getSpecialitiesTree(),
      ApiService.getPanditReferences(),
      TokenManager.getUserProfile(),
    ]).then(([langs, tree, refs, profile]) => {
      setLanguages(langs);
      setSpecialityTree(tree);
      setReferences(refs);
      if (profile.name) setFullName(profile.name);
      if (profile.mobile) setContact(profile.mobile);
    });
  }, []);

  const showModal = (title: string, message: string, type: 'success' | 'error') => {
    setModalData({ title, message, type });
    setModalVisible(true);
  };

  const toggleLanguage = (id: string) => {
    setSelectedLanguageIds(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const toggleSpeciality = (id: string) => {
    setSelectedSpecialityIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const pickDocument = async (setter: (v: string) => void) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (!result.canceled && result.assets[0]) setter(result.assets[0].uri);
    } catch { Alert.alert('Error', 'Could not pick document'); }
  };

  const pickImage = async (setter: (v: string) => void) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) { Alert.alert('Permission Required', 'Please allow access to your photo library.'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!result.canceled && result.assets[0]) setter(result.assets[0].uri);
    } catch { Alert.alert('Error', 'Could not pick image'); }
  };


  const validate = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.fullName = 'Full name must be at least 2 characters';
    if (contact.length !== 10) e.contact = 'Contact number must be exactly 10 digits';
    if (pin.length < 5) e.pin = 'Pin code must be at least 5 digits';
    if (!experience) e.experience = 'Please select experience';
    if (selectedSpecialityIds.length === 0) e.speciality = 'Please select at least one speciality';
    return e;
  };

  const canSubmit = !loading;

  const onSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const result = await ApiService.registerPandit({
        name: fullName.trim(),
        contact_no: contact,
        pin_code: pin,
        exp_in_years: experience,
        pandits_under_count: numPandits ? parseInt(numPandits, 10) : 0,
        reference_code: refCode.trim() || null,
        speciality_ids: selectedSpecialityIds,
        language_ids: selectedLanguageIds,
        id_proof_url: aadharFile ?? null,
        certificate_url: certFile ?? null,
        profile_photo_url: profilePhoto ?? null,
        mandir_image_url: null,
      });

      if (result.success) {
        setRegisteredName(result.data?.name ?? fullName.trim());
        setSuccessModalVisible(true);
      } else {
        showModal('Error', result.message, 'error');
      }
    } catch {
      showModal('Error', 'Something went wrong. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Find labels for selected specialities
  const getSpecialityLabel = (id: string) => {
    for (const parent of specialityTree) {
      if (parent.id === id) return parent.name;
      const sub = parent.subSpecialities.find(s => s.id === id);
      if (sub) return `${parent.name} › ${sub.name}`;
    }
    return id;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
          </Pressable>
          <View style={styles.brandLogo}>
            <Image source={require('@/assets/images/logo.jpg')} style={styles.brandLogoImg} contentFit="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.headerTitle}>{t('panditRegTitle')}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{t('panditRegSubtitle')}</ThemedText>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <ThemedText style={styles.desc}>{t('panditRegDesc')}</ThemedText>

          {/* ── Language (first field, loaded from API type=2) ── */}
          <Field label={t('poojaLanguages')}>
            <MultiSelectChips
              options={languages}
              selectedIds={selectedLanguageIds}
              onToggle={toggleLanguage}
              placeholder={languages.length === 0 ? 'Loading languages...' : t('selectLanguages')}
            />
          </Field>

          <Field label={t('fullName')} required>
            <TextInput value={fullName} onChangeText={v => { setFullName(v); setErrors(p => ({ ...p, fullName: '' })); }} placeholder={t('fullNamePlaceholder')} placeholderTextColor={BRAND.textSecondary} style={styles.input} />
            {errors.fullName ? <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText> : null}
          </Field>

          <Field label={t('contactNumber')} required>
            <TextInput value={contact} onChangeText={v => { setContact(v.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, contact: '' })); }} placeholder={t('contactNumberPlaceholder')} placeholderTextColor={BRAND.textSecondary} inputMode="numeric" keyboardType="number-pad" maxLength={10} style={styles.input} />
            {errors.contact ? <ThemedText style={styles.errorText}>{errors.contact}</ThemedText> : null}
          </Field>

          <Field label={t('pinCode')} required>
            <TextInput value={pin} onChangeText={v => { setPin(v.replace(/\D/g, '').slice(0, 6)); setErrors(p => ({ ...p, pin: '' })); }} placeholder={t('pinCodePlaceholder')} placeholderTextColor={BRAND.textSecondary} inputMode="numeric" keyboardType="number-pad" maxLength={6} style={styles.input} />
            {errors.pin ? <ThemedText style={styles.errorText}>{errors.pin}</ThemedText> : null}
          </Field>

          <Field label={t('experienceYears')} required>
            <SelectField value={experience} placeholder={t('selectExperience')} options={EXPERIENCE_OPTIONS} onChange={v => { setExperience(v); setErrors(p => ({ ...p, experience: '' })); }} />
            {errors.experience ? <ThemedText style={styles.errorText}>{errors.experience}</ThemedText> : null}
          </Field>

          {/* ── Speciality tree dropdown — multi-select ── */}
          <Field label={t('speciality')} required>
            <SpecialityMultiField
              tree={specialityTree}
              selectedIds={selectedSpecialityIds}
              placeholder={specialityTree.length === 0 ? 'Loading specialities...' : t('selectSpeciality')}
              onToggle={toggleSpeciality}
              getLabel={getSpecialityLabel}
            />
            {errors.speciality ? <ThemedText style={styles.errorText}>{errors.speciality}</ThemedText> : null}
          </Field>

          <Field label={t('numberOfPandits')}>
            <TextInput value={numPandits} onChangeText={v => setNumPandits(v.replace(/\D/g, '').slice(0, 4))} placeholder={t('numberOfPanditsPlaceholder')} placeholderTextColor={BRAND.textSecondary} inputMode="numeric" keyboardType="number-pad" style={styles.input} />
          </Field>

          <Field label={t('referenceCodeOptional')}>
            <SelectField
              value={references.find(r => r.id === refCode)?.name ?? refCode}
              placeholder={references.length === 0 ? 'Loading references...' : t('enterReferenceCode')}
              options={references.map(r => r.name)}
              onChange={name => {
                const found = references.find(r => r.name === name);
                if (found) setRefCode(found.id);
              }}
            />
          </Field>

          <View style={styles.docsSection}>
            <ThemedText style={styles.docsSectionTitle}>Documents <ThemedText style={styles.optionalTag}>(Optional)</ThemedText></ThemedText>
            <ThemedText style={styles.docsSectionSubtitle}>Upload documents to speed up verification</ThemedText>
            <UploadRow icon={{ ios: 'creditcard.fill', android: 'badge', web: 'badge' }} label="Aadhar Card / ID Proof" subtitle="PDF or Image" fileName={aadharFile} onPress={() => pickDocument(setAadharFile)} onRemove={() => setAadharFile(null)} />
            <UploadRow icon={{ ios: 'doc.text.fill', android: 'workspace_premium', web: 'workspace_premium' }} label="Certificates / Qualifications" subtitle="PDF or Image" fileName={certFile} onPress={() => pickDocument(setCertFile)} onRemove={() => setCertFile(null)} />
            <UploadRow icon={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }} label="Profile Photo" subtitle="Image" fileName={profilePhoto ? 'Photo selected ✓' : null} previewUri={profilePhoto} onPress={() => pickImage(setProfilePhoto)} onRemove={() => setProfilePhoto(null)} />
          </View>

          <View style={styles.noteBox}>
            <ThemedText style={styles.noteLabel}>{t('panditRegNoteLabel')}</ThemedText>
            <ThemedText style={styles.noteText}>{t('panditRegNote')}</ThemedText>
          </View>

          <Pressable
            onPress={onSubmit}
            style={({ pressed }) => [styles.submitBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.submitText}>{loading ? 'Submitting...' : t('submitRegistration')}</ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      <MessageModal visible={modalVisible} onClose={() => setModalVisible(false)} title={modalData.title} message={modalData.message} type={modalData.type} />

      <Modal visible={successModalVisible} transparent animationType="fade" onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconWrap}>
              <ThemedText style={styles.successEmoji}>🙏</ThemedText>
            </View>
            <ThemedText style={styles.successTitle}>Registration Successful!</ThemedText>
            <ThemedText style={styles.successName}>{registeredName}</ThemedText>
            <ThemedText style={styles.successMsg}>
              Your Pandit registration has been submitted successfully. Our team will review and confirm within 2-3 business days.
            </ThemedText>
            <Pressable
              onPress={() => { setSuccessModalVisible(false); router.replace('/(tabs)/home'); }}
              style={({ pressed }) => [styles.successBtn, pressed && styles.pressed]}>
              <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.successBtnGradient}>
                <ThemedText style={styles.successBtnText}>Go to Home</ThemedText>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Multi-select chip selector for languages with Done button
function MultiSelectChips({ options, selectedIds, onToggle, placeholder }: {
  options: ExtraField[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable onPress={() => setOpen(o => !o)} style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        {selectedIds.length === 0 ? (
          <ThemedText style={[styles.selectText, styles.placeholderText]}>{placeholder}</ThemedText>
        ) : (
          <View style={styles.chipsRow}>
            {selectedIds.map(id => {
              const lang = options.find(o => o.id === id);
              return lang ? (
                <View key={id} style={styles.chip}>
                  <ThemedText style={styles.chipText}>{lang.description}</ThemedText>
                </View>
              ) : null;
            })}
          </View>
        )}
        <SymbolView name={{ ios: open ? 'chevron.up' : 'chevron.down', android: open ? 'expand_less' : 'expand_more', web: open ? 'expand_less' : 'expand_more' }} tintColor={BRAND.textSecondary} size={16} />
      </Pressable>
      {open && (
        <View style={styles.dropdown}>
          {options.map(opt => {
            const selected = selectedIds.includes(opt.id);
            return (
              <Pressable key={opt.id} onPress={() => onToggle(opt.id)} style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
                <ThemedText style={styles.dropdownItemText}>{opt.description}</ThemedText>
                {selected && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={BRAND.primary} size={16} />}
              </Pressable>
            );
          })}
          <Pressable onPress={() => setOpen(false)} style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.doneBtnText}>Done</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// Multi-select speciality tree
function SpecialityMultiField({ tree, selectedIds, placeholder, onToggle, getLabel }: {
  tree: SpecialityTree[];
  selectedIds: string[];
  placeholder: string;
  onToggle: (id: string) => void;
  getLabel: (id: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<string[]>([]);

  const toggleParentExpand = (id: string) => {
    setExpandedParents(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <View>
      <Pressable onPress={() => setOpen(o => !o)} style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        {selectedIds.length === 0 ? (
          <ThemedText style={[styles.selectText, styles.placeholderText]} numberOfLines={1}>{placeholder}</ThemedText>
        ) : (
          <View style={styles.chipsRow}>
            {selectedIds.map(id => (
              <View key={id} style={styles.chip}>
                <ThemedText style={styles.chipText} numberOfLines={1}>{getLabel(id)}</ThemedText>
              </View>
            ))}
          </View>
        )}
        <SymbolView name={{ ios: open ? 'chevron.up' : 'chevron.down', android: open ? 'expand_less' : 'expand_more', web: open ? 'expand_less' : 'expand_more' }} tintColor={BRAND.textSecondary} size={16} />
      </Pressable>
      {open && (
        <View style={styles.dropdown}>
          {tree.map(parent => {
            const isExpanded = expandedParents.includes(parent.id);
            const isSelected = selectedIds.includes(parent.id);
            return (
              <View key={parent.id}>
                <Pressable
                  onPress={() => onToggle(parent.id)}
                  style={({ pressed }) => [styles.treeParentRow, isSelected && styles.treeSelectedRow, pressed && styles.pressed]}>
                  <ThemedText style={[styles.treeParentText, isSelected && styles.treeSelectedText]} numberOfLines={1}>{parent.name}</ThemedText>
                  {isSelected && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={BRAND.primary} size={14} />}
                  {parent.subSpecialities.length > 0 && (
                    <Pressable
                      onPress={e => { e.stopPropagation?.(); toggleParentExpand(parent.id); }}
                      style={({ pressed }) => [styles.expandBtn, pressed && styles.pressed]}>
                      <SymbolView
                        name={isExpanded ? { ios: 'minus', android: 'remove', web: 'remove' } : { ios: 'plus', android: 'add', web: 'add' }}
                        tintColor={BRAND.primary} size={14}
                      />
                    </Pressable>
                  )}
                </Pressable>
                {isExpanded && parent.subSpecialities.map(sub => {
                  const isSubSelected = selectedIds.includes(sub.id);
                  return (
                    <Pressable
                      key={sub.id}
                      onPress={() => onToggle(sub.id)}
                      style={({ pressed }) => [styles.treeSubRow, isSubSelected && styles.treeSelectedRow, pressed && styles.pressed]}>
                      <ThemedText style={[styles.treeSubText, isSubSelected && styles.treeSelectedText]} numberOfLines={1}>{sub.name}</ThemedText>
                      {isSubSelected && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={BRAND.primary} size={14} />}
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
          <Pressable onPress={() => setOpen(false)} style={({ pressed }) => [styles.doneBtn, pressed && styles.pressed]}>
            <ThemedText style={styles.doneBtnText}>Done</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function UploadRow({ icon, label, subtitle, fileName, previewUri, onPress, onRemove }: {
  icon: { ios: string; android: string; web: string };
  label: string; subtitle: string; fileName: string | null;
  previewUri?: string | null; onPress: () => void; onRemove: () => void;
}) {
  return (
    <View style={styles.uploadRow}>
      <View style={styles.uploadIconBg}>
        <SymbolView name={icon} tintColor={BRAND.primary} size={20} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.uploadLabel}>{label}</ThemedText>
        <ThemedText style={styles.uploadSubtitle}>{subtitle}</ThemedText>
        {fileName ? (
          <View style={styles.uploadedRow}>
            {previewUri
              ? <Image source={{ uri: previewUri }} style={styles.previewThumb} contentFit="cover" />
              : <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor="#16A34A" size={14} />
            }
            <ThemedText style={styles.uploadedName} numberOfLines={1}>{fileName}</ThemedText>
          </View>
        ) : null}
      </View>
      {fileName ? (
        <Pressable onPress={onRemove} style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}>
          <SymbolView name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }} tintColor="#DC2626" size={20} />
        </Pressable>
      ) : (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.browseBtn, pressed && styles.pressed]}>
          <ThemedText style={styles.browseBtnText}>Browse</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>
        {label}{required ? <ThemedText style={styles.required}> *</ThemedText> : null}
      </ThemedText>
      {children}
    </View>
  );
}

function SelectField({ value, placeholder, options, onChange }: {
  value: string; placeholder: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable onPress={() => setOpen(o => !o)} style={({ pressed }) => [styles.input, styles.selectRow, pressed && styles.pressed]}>
        <ThemedText style={[styles.selectText, !value && styles.placeholderText]}>{value || placeholder}</ThemedText>
        <SymbolView name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }} tintColor={BRAND.textSecondary} size={16} />
      </Pressable>
      {open ? (
        <View style={styles.dropdown}>
          {options.map(opt => (
            <Pressable key={opt} onPress={() => { onChange(opt); setOpen(false); }} style={({ pressed }) => [styles.dropdownItem, pressed && styles.pressed]}>
              <ThemedText style={styles.dropdownItemText}>{opt}</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingTop: Spacing.two, gap: 10 },
  backBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  brandLogo: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  brandLogoImg: { width: '94%', height: '94%' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#FFE7CF', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five },
  card: { backgroundColor: BRAND.card, borderWidth: 1, borderColor: BRAND.border, borderRadius: 14, padding: Spacing.three, gap: Spacing.two },
  desc: { fontSize: 13, color: BRAND.textSecondary, marginBottom: Spacing.one },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  required: { color: BRAND.required, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: BRAND.inputBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: BRAND.text, backgroundColor: '#FFFFFF', ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null) },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  selectText: { fontSize: 14, color: BRAND.text, flexShrink: 1 },
  placeholderText: { color: BRAND.textSecondary },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 1 },
  chip: { backgroundColor: BRAND.chipBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  chipText: { color: BRAND.chipText, fontSize: 12, fontWeight: '700' },
  dropdown: { marginTop: 4, borderWidth: 1, borderColor: BRAND.inputBorder, borderRadius: 10, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  dropdownItemText: { fontSize: 14, color: BRAND.text },
  // Tree styles
  treeParentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BRAND.border, gap: 8 },
  treeParentText: { flex: 1, fontSize: 14, fontWeight: '700', color: BRAND.text },
  treeSubRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 28, paddingRight: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BRAND.border, gap: 8, backgroundColor: '#FAFAF8' },
  treeSubText: { flex: 1, fontSize: 13, color: BRAND.textSecondary },
  treeSelectedRow: { backgroundColor: '#FFF1DE' },
  treeSelectedText: { color: BRAND.primary, fontWeight: '700' },
  expandBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' },
  noteBox: { backgroundColor: BRAND.noteBg, borderWidth: 1, borderColor: BRAND.noteBorder, borderRadius: 10, padding: 12, gap: 4 },
  noteLabel: { fontSize: 12, fontWeight: '800', color: BRAND.primaryDark },
  noteText: { fontSize: 12, color: BRAND.text, lineHeight: 18 },
  submitBtn: { backgroundColor: BRAND.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.one },
  errorText: { fontSize: 12, color: BRAND.required, marginTop: 3 },
  doneBtn: { alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: BRAND.border, backgroundColor: '#FFF8F0' },
  doneBtnText: { fontSize: 14, fontWeight: '800', color: BRAND.primary },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.85 },
  docsSection: { gap: 10, marginTop: 4 },
  docsSectionTitle: { fontSize: 14, fontWeight: '800', color: BRAND.text },
  optionalTag: { fontSize: 12, fontWeight: '500', color: BRAND.textSecondary },
  docsSectionSubtitle: { fontSize: 12, color: BRAND.textSecondary, marginTop: -4 },
  uploadRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FAFAF8', borderWidth: 1, borderColor: BRAND.border, borderRadius: 12, padding: 12 },
  uploadIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center' },
  uploadLabel: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  uploadSubtitle: { fontSize: 11, color: BRAND.textSecondary, marginTop: 2 },
  uploadedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  uploadedName: { fontSize: 11, color: '#16A34A', fontWeight: '600', flex: 1 },
  previewThumb: { width: 24, height: 24, borderRadius: 4 },
  browseBtn: { backgroundColor: BRAND.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  browseBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  removeBtn: { padding: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successModal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, alignItems: 'center', width: '100%', maxWidth: 340, gap: 10 },
  successIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF1DE', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  successEmoji: { fontSize: 36 },
  successTitle: { fontSize: 20, fontWeight: '800', color: BRAND.text, textAlign: 'center' },
  successName: { fontSize: 16, fontWeight: '700', color: BRAND.primary, textAlign: 'center' },
  successMsg: { fontSize: 13, color: BRAND.textSecondary, textAlign: 'center', lineHeight: 19 },
  successBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 6, width: '100%' },
  successBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  successBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
