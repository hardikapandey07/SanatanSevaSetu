import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageModal } from '@/components/message-modal';
import { ThemedText } from '@/components/themed-text';
import { ApiService, TokenManager, type ExtraField } from '@/constants/api';
import { Spacing } from '@/constants/theme';
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
};

export default function MandirRegisterScreen() {
  const t = useT();

  const [deities, setDeities] = useState<ExtraField[]>([]);

  // Required fields
  const [mandirName, setMandirName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [email, setEmail] = useState('');
  const [openingTime, setOpeningTime] = useState('');
  const [closingTime, setClosingTime] = useState('');

  // Optional fields
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [pujaCentreName, setPujaCentreName] = useState('');
  const [chadhavaDetails, setChadhavaDetails] = useState('');
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyDescription, setHistoryDescription] = useState('');
  const [panditNames, setPanditNames] = useState('');
  const [godIds, setGodIds] = useState<string[]>([]);
  const [showOtherDeity, setShowOtherDeity] = useState(false);
  const [otherDeities, setOtherDeities] = useState<string[]>(['']);

  const [mandirImage, setMandirImage] = useState<string | null>(null);

  const pickMandirImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showModal('Permission Required', 'Please allow access to your photo library.', 'error');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setMandirImage(result.assets[0].uri);
  };

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    ApiService.getExtraFields(3).then(setDeities);
    TokenManager.getUserProfile().then(profile => {
      if (profile.name) setContactPerson(profile.name);
      if (profile.mobile) setContactNo(profile.mobile);
    });
  }, []);

  const showModal = (title: string, message: string, type: 'success' | 'error') => {
    setModalData({ title, message, type });
    setModalVisible(true);
  };

  const toggleGod = (id: string) => {
    setGodIds(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const addOtherDeityRow = () => setOtherDeities(prev => [...prev, '']);
  const updateOtherDeity = (index: number, value: string) =>
    setOtherDeities(prev => prev.map((v, i) => i === index ? value : v));
  const removeOtherDeity = (index: number) =>
    setOtherDeities(prev => prev.length === 1 ? [''] : prev.filter((_, i) => i !== index));
  const toggleOtherDeity = () => {
    setShowOtherDeity(p => !p);
    if (showOtherDeity) setOtherDeities(['']);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (mandirName.trim().length < 2) e.mandirName = 'Mandir name must be at least 2 characters';
    if (address.trim().length < 5) e.address = 'Please enter a valid address';
    if (contactPerson.trim().length < 2) e.contactPerson = 'Contact person name is required';
    if (contactNo.length !== 10) e.contactNo = 'Contact number must be exactly 10 digits';
    if (!email.includes('@') || !email.includes('.')) e.email = 'Please enter a valid email address';
    if (!openingTime.trim()) e.openingTime = 'Opening time is required';
    if (!closingTime.trim()) e.closingTime = 'Closing time is required';
    return e;
  };

  const onSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    const panditNamesArr = panditNames.trim()
      ? panditNames.split(',').map(n => n.trim()).filter(Boolean)
      : [];
    setLoading(true);
    try {
      const result = await ApiService.registerMandir({
        mandir_name: mandirName.trim(),
        address: address.trim(),
        latitude: latitude ? parseFloat(latitude) : 0,
        longitude: longitude ? parseFloat(longitude) : 0,
        opening_time: openingTime.trim(),
        closing_time: closingTime.trim(),
        contact_person: contactPerson.trim(),
        contact_no: contactNo,
        email_id: email.trim(),
        puja_centre_name: pujaCentreName.trim(),
        chadhava_details: chadhavaDetails.trim(),
        god_ids: godIds,
        pandit_names: panditNamesArr,
        history_title: historyTitle.trim(),
        history_description: historyDescription.trim(),
      });
      if (result.success) {
        setRegisteredName(mandirName.trim());
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

  return (
    <View style={styles.root}>
      <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor="#FFFFFF" size={18} />
          </Pressable>
          <View style={styles.brandLogo}>
            <Image source={require('@/assets/images/logo.jpg')} style={styles.brandLogoImg} contentFit="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.headerTitle}>{t('mandirRegTitle')}</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{t('mandirRegSubtitle')}</ThemedText>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <ThemedText style={styles.desc}>{t('mandirRegDesc')}</ThemedText>

          <SectionHeading title="Basic Information" />

          <Field label="Mandir Name" required>
            <TextInput value={mandirName} onChangeText={v => { setMandirName(v); setErrors(p => ({ ...p, mandirName: '' })); }} placeholder="Enter mandir name" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
            {errors.mandirName ? <ThemedText style={styles.errorText}>{errors.mandirName}</ThemedText> : null}
          </Field>
          <Field label="Address" required>
            <TextInput value={address} onChangeText={v => { setAddress(v); setErrors(p => ({ ...p, address: '' })); }} placeholder="Enter full address" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
            {errors.address ? <ThemedText style={styles.errorText}>{errors.address}</ThemedText> : null}
          </Field>
          <Field label="Contact Person" required>
            <TextInput value={contactPerson} onChangeText={v => { setContactPerson(v); setErrors(p => ({ ...p, contactPerson: '' })); }} placeholder="Enter contact person name" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
            {errors.contactPerson ? <ThemedText style={styles.errorText}>{errors.contactPerson}</ThemedText> : null}
          </Field>
          <Field label="Contact Number" required>
            <TextInput value={contactNo} onChangeText={v => { setContactNo(v.replace(/\D/g, '').slice(0, 10)); setErrors(p => ({ ...p, contactNo: '' })); }} placeholder="Enter 10-digit mobile number" placeholderTextColor={BRAND.textSecondary} inputMode="numeric" keyboardType="number-pad" maxLength={10} style={styles.input} />
            {errors.contactNo ? <ThemedText style={styles.errorText}>{errors.contactNo}</ThemedText> : null}
          </Field>
          <Field label="Email ID" required>
            <TextInput value={email} onChangeText={v => { setEmail(v); setErrors(p => ({ ...p, email: '' })); }} placeholder="Enter email address" placeholderTextColor={BRAND.textSecondary} inputMode="email" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            {errors.email ? <ThemedText style={styles.errorText}>{errors.email}</ThemedText> : null}
          </Field>

          <SectionHeading title="Timings" />
          <Field label="Opening Time" required>
            <TextInput value={openingTime} onChangeText={v => { setOpeningTime(v); setErrors(p => ({ ...p, openingTime: '' })); }} placeholder="e.g. 05:30:00" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
            {errors.openingTime ? <ThemedText style={styles.errorText}>{errors.openingTime}</ThemedText> : null}
          </Field>
          <Field label="Closing Time" required>
            <TextInput value={closingTime} onChangeText={v => { setClosingTime(v); setErrors(p => ({ ...p, closingTime: '' })); }} placeholder="e.g. 23:30:00" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
            {errors.closingTime ? <ThemedText style={styles.errorText}>{errors.closingTime}</ThemedText> : null}
          </Field>

          <SectionHeading title="Location (Optional)" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Latitude">
                <TextInput value={latitude} onChangeText={setLatitude} placeholder="e.g. 19.0169" placeholderTextColor={BRAND.textSecondary} inputMode="decimal" keyboardType="decimal-pad" style={styles.input} />
              </Field>
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Longitude">
                <TextInput value={longitude} onChangeText={setLongitude} placeholder="e.g. 72.8304" placeholderTextColor={BRAND.textSecondary} inputMode="decimal" keyboardType="decimal-pad" style={styles.input} />
              </Field>
            </View>
          </View>

          <SectionHeading title="Puja Details (Optional)" />
          <Field label="Puja Centre Name">
            <TextInput value={pujaCentreName} onChangeText={setPujaCentreName} placeholder="Enter puja centre or hall name" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
          </Field>
          <Field label="Chadhava Details">
            <TextInput value={chadhavaDetails} onChangeText={setChadhavaDetails} placeholder="e.g. Naral, phul, prasad" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
          </Field>
          <Field label="Pandit Names (comma separated)">
            <TextInput value={panditNames} onChangeText={setPanditNames} placeholder="e.g. Ramesh, Suresh, Ganesh" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
          </Field>

          {/* ── Deities from API extrafields/3 ── */}
          <SectionHeading title="Deities Worshipped (Optional)" />
          <ThemedText style={styles.deityHint}>
            {deities.length === 0 ? 'Loading deities...' : 'Tap to select deities worshipped in this mandir'}
          </ThemedText>
          <View style={styles.godsGrid}>
            {deities.map(deity => {
              const selected = godIds.includes(deity.id);
              return (
                <Pressable
                  key={deity.id}
                  onPress={() => toggleGod(deity.id)}
                  style={({ pressed }) => [styles.godChip, selected && styles.godChipSelected, pressed && styles.pressed]}>
                  <ThemedText style={[styles.godChipText, selected && styles.godChipTextSelected]}>
                    {deity.description}
                  </ThemedText>
                  {selected && (
                    <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor="#FFFFFF" size={12} />
                  )}
                </Pressable>
              );
            })}

            {/* Other chip */}
            <Pressable
              onPress={toggleOtherDeity}
              style={({ pressed }) => [styles.godChip, showOtherDeity && styles.godChipSelected, pressed && styles.pressed]}>
              <ThemedText style={[styles.godChipText, showOtherDeity && styles.godChipTextSelected]}>
                Other
              </ThemedText>
              {showOtherDeity && (
                <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor="#FFFFFF" size={12} />
              )}
            </Pressable>
          </View>

          {/* Other deities input rows */}
          {showOtherDeity && (
            <View style={styles.otherDeityBox}>
              <ThemedText style={styles.otherDeityLabel}>Add Other Deities</ThemedText>
              {otherDeities.map((val, index) => (
                <View key={index} style={styles.otherDeityRow}>
                  <TextInput
                    value={val}
                    onChangeText={text => updateOtherDeity(index, text)}
                    placeholder={`Deity name ${index + 1}`}
                    placeholderTextColor={BRAND.textSecondary}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <Pressable
                    onPress={() => removeOtherDeity(index)}
                    style={({ pressed }) => [styles.otherDeityRemove, pressed && styles.pressed]}>
                    <SymbolView
                      name={{ ios: 'minus.circle.fill', android: 'remove_circle', web: 'remove_circle' }}
                      tintColor="#DC2626"
                      size={20}
                    />
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={addOtherDeityRow}
                style={({ pressed }) => [styles.addMoreBtn, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                  tintColor={BRAND.primary}
                  size={18}
                />
                <ThemedText style={styles.addMoreText}>Add Another Deity</ThemedText>
              </Pressable>
            </View>
          )}

          <SectionHeading title="Mandir History (Optional)" />
          <Field label="History Title">
            <TextInput value={historyTitle} onChangeText={setHistoryTitle} placeholder="e.g. An ancient Shiva temple" placeholderTextColor={BRAND.textSecondary} style={styles.input} />
          </Field>
          <Field label="History Description">
            <TextInput value={historyDescription} onChangeText={setHistoryDescription} placeholder="Enter mandir history and description..." placeholderTextColor={BRAND.textSecondary} multiline numberOfLines={4} style={[styles.input, styles.textArea]} />
          </Field>

          {/* ── Mandir Image — last field, same UploadRow design as pandit-register ── */}
          <View style={styles.docsSection}>
            <ThemedText style={styles.docsSectionTitle}>Mandir / Temple Image <ThemedText style={styles.optionalTag}>(Optional)</ThemedText></ThemedText>
            <ThemedText style={styles.docsSectionSubtitle}>Upload a photo of the mandir for display</ThemedText>
            <UploadRow
              icon={{ ios: 'photo.on.rectangle', android: 'add_photo_alternate', web: 'add_photo_alternate' }}
              label="Add Mandir / Temple Image"
              subtitle="JPG or PNG · Recommended 16:9"
              fileName={mandirImage ? 'Image selected ✓' : null}
              previewUri={mandirImage}
              onPress={pickMandirImage}
              onRemove={() => setMandirImage(null)}
            />
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
              <ThemedText style={styles.successEmoji}>🛕</ThemedText>
            </View>
            <ThemedText style={styles.successTitle}>Registration Successful!</ThemedText>
            <ThemedText style={styles.successName}>{registeredName}</ThemedText>
            <ThemedText style={styles.successMsg}>
              Your Mandir registration has been submitted successfully. Our team will review and confirm within 2-3 business days.
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

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionBar} />
      <ThemedText style={styles.sectionHeading}>{title}</ThemedText>
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
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  sectionBar: { width: 4, height: 16, borderRadius: 2, backgroundColor: BRAND.primary },
  sectionHeading: { fontSize: 14, fontWeight: '800', color: BRAND.text },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  required: { color: BRAND.required, fontWeight: '700' },
  input: {
    borderWidth: 1, borderColor: BRAND.inputBorder, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: BRAND.text,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  deityHint: { fontSize: 12, color: BRAND.textSecondary, marginTop: -4 },
  godsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  godChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5, borderColor: BRAND.border, backgroundColor: '#FAFAF8' },
  godChipSelected: { backgroundColor: BRAND.primary, borderColor: BRAND.primary },
  godChipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },
  godChipTextSelected: { color: '#FFFFFF' },
  otherDeityBox: {
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    backgroundColor: '#FAFAF8',
    padding: 12,
    gap: 10,
  },
  otherDeityLabel: { fontSize: 13, fontWeight: '700', color: BRAND.text },
  otherDeityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  otherDeityRemove: { padding: 2 },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  addMoreText: { fontSize: 13, fontWeight: '700', color: BRAND.primary },
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
  noteBox: { backgroundColor: BRAND.noteBg, borderWidth: 1, borderColor: BRAND.noteBorder, borderRadius: 10, padding: 12, gap: 4 },
  noteLabel: { fontSize: 12, fontWeight: '800', color: BRAND.primaryDark },
  noteText: { fontSize: 12, color: BRAND.text, lineHeight: 18 },
  submitBtn: { backgroundColor: BRAND.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: Spacing.one },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 3 },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  pressed: { opacity: 0.85 },
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
