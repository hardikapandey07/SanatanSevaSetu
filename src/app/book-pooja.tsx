import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ApiService, type Pandit, type Service } from '@/constants/api';
import { getApiBaseUrl } from '@/constants/environment';
import { Spacing } from '@/constants/theme';
import { useT } from '@/i18n/LanguageContext';
import type { TranslationKey } from '@/i18n/translations';

const BRAND = {
  primary: '#E8731C',
  primaryDark: '#C95A0E',
  bg: '#F7F4EE',
  card: '#FFFFFF',
  border: '#EFE7D7',
  text: '#1F1A14',
  textSecondary: '#6B6258',
  inputBorder: '#E5DCC8',
  selectedBg: '#FFF1DE',
  disabledBg: '#CFC4B0',
};



const TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

const GOTRAS = [
  'Kashyap', 'Bharadwaj', 'Vashishtha', 'Atri', 'Vishwamitra',
  'Gautam', 'Jamadagni', 'Agastya', 'Garg', 'Parashar',
  'Shandilya', 'Kaushik', 'Angiras', 'Pulastya', 'Kratu',
];

const STEP_LABELS: TranslationKey[] = ['selectService', 'gotra', 'chooseDateTime', 'selectPanditji', 'payment'];

export default function BookPoojaScreen() {
  const t = useT();
  const params = useLocalSearchParams<{ serviceId?: string }>();
  const preselectedServiceId = params.serviceId ?? '';

  const [step, setStep] = useState(preselectedServiceId ? 2 : 1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [pandits, setPandits] = useState<Pandit[]>([]);
  const [loadingPandits, setLoadingPandits] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId);
  const [gotra, setGotra] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    ApiService.getServices().then(data => {
      setServices(data.filter(s => s.is_active));
      setLoadingServices(false);
    });
    ApiService.getPandits().then(data => {
      setPandits(data);
      setLoadingPandits(false);
    });
    ApiService.getProfile().then(res => {
      if (res.success && res.data) {
        setAddress(res.data.address ?? '');
        setEmail(res.data.email_id ?? '');
      }
    });
  }, []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [pandit, setPandit] = useState('');

  const canProceed =
    (step === 1 && !!selectedServiceId) ||
    (step === 2 && !!gotra) ||
    (step === 3 && !!date && !!time) ||
    (step === 4 && !!pandit);

  const groupedServices = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setDate(formatDate(selectedDate));
    }
  };

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    // Today
    options.push({
      label: 'Today',
      dateText: today.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      date: today
    });
    
    // Tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    options.push({
      label: 'Tomorrow',
      dateText: tomorrow.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      date: tomorrow
    });
    
    // Next 5 days
    for (let i = 2; i <= 6; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      options.push({
        label: futureDate.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateText: futureDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        date: futureDate
      });
    }
    
    return options;
  };
  
  const selectDateOption = (dateOption: { label: string; dateText: string; date: Date }) => {
    setSelectedDate(dateOption.date);
    setDate(formatDate(dateOption.date));
    setShowDatePicker(false);
  };

  // Calendar functionality
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const goToPreviousMonth = () => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  const selectCalendarDate = (calendarDate: Date) => {
    setSelectedDate(calendarDate);
    setDate(formatDate(calendarDate));
    setShowDatePicker(false);
  };
  
  const isDateDisabled = (calendarDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate());
    return d < today;
  };
  
  const isDateSelected = (calendarDate: Date) => {
    if (!date) return false;
    return formatDate(calendarDate) === date;
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const selectedPandit = pandits.find(p => p.PanditId === pandit);

  const onNext = () => {
    if (!canProceed) return;
    if (step < 4) { setStep(step + 1); return; }
    setDetailsError('');
    setShowDetailsSheet(true);
  };

  const onDetailsSubmit = async () => {
    if (!address || !email) return;
    setDetailsLoading(true);
    setDetailsError('');
    const result = await ApiService.updateProfile({ address, email_id: email });
    setDetailsLoading(false);
    if (!result.success) {
      setDetailsError(result.message);
      return;
    }
    setShowDetailsSheet(false);
    router.push({
      pathname: '/payment',
      params: {
        service: selectedService?.name ?? '',
        serviceId: selectedService?.id ?? '',
        servicePrice: String(selectedService?.price ?? ''),
        provider: selectedPandit?.Name ?? '',
        providerId: selectedPandit?.PanditId ?? '',
        date,
        time,
        gotra,
        address,
        email,
      },
    });
  };

  const onBack = () => {
    if (step === 2 && preselectedServiceId) { router.back(); return; }
    if (step === 1) { router.back(); return; }
    setStep(step - 1);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[BRAND.primary, BRAND.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <Pressable
            onPress={onBack}
            accessibilityLabel="Back"
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              tintColor="#FFFFFF"
              size={18}
            />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{t('bookServiceTitle')}</ThemedText>
        </SafeAreaView>
      </LinearGradient>

      {/* Stepper — fixed, always visible */}
      <View style={styles.stepperContainer}>
        <Stepper current={step} labels={STEP_LABELS.map(k => t(k))} />
      </View>

      {/* Scrollable step content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Step 1 — Select Puja */}
          {step === 1 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectService')}</ThemedText>
              {loadingServices ? (
                <ActivityIndicator size="small" color={BRAND.primary} />
              ) : (
                <View style={{ gap: 14 }}>
                  {Object.entries(groupedServices).map(([category, items]) => (
                    <View key={category} style={{ gap: 8 }}>
                      <ThemedText style={styles.categoryLabel}>{category}</ThemedText>
                      {items.map(s => (
                        <Pressable
                          key={s.id}
                          onPress={() => setSelectedServiceId(s.id)}
                          style={({ pressed }) => [
                            styles.serviceRow,
                            selectedServiceId === s.id && styles.serviceRowSelected,
                            pressed && styles.pressed,
                          ]}>
                          <View style={styles.serviceThumb}>
                            {s.image_url ? (
                              <Image
                                source={{ uri: `${getApiBaseUrl()}/${s.image_url}` }}
                                style={styles.serviceThumbImg}
                                contentFit="cover"
                              />
                            ) : (
                              <ThemedText style={styles.serviceThumbEmoji}>🪔</ThemedText>
                            )}
                          </View>
                          <View style={styles.serviceInfo}>
                            <ThemedText
                              style={[styles.serviceLabel, selectedServiceId === s.id && styles.serviceLabelSelected]}
                              numberOfLines={2}>
                              {s.name}
                            </ThemedText>
                            <ThemedText style={[styles.servicePrice, selectedServiceId === s.id && styles.servicePriceSelected]}>
                              ₹{s.price.toLocaleString()}
                            </ThemedText>
                          </View>
                          <View style={styles.serviceCheckWrap}>
                            {selectedServiceId === s.id && (
                              <SymbolView
                                name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                                tintColor={BRAND.primary}
                                size={20}
                              />
                            )}
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Step 2 — Select Gotra */}
          {step === 2 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectGotra')}</ThemedText>
              <View style={{ gap: 8 }}>
                {GOTRAS.map(g => (
                  <Pressable
                    key={g}
                    onPress={() => setGotra(g)}
                    style={({ pressed }) => [
                      styles.serviceRow,
                      gotra === g && styles.serviceRowSelected,
                      pressed && styles.pressed,
                    ]}>
                    <View style={[styles.serviceThumb, { backgroundColor: '#FFF1DE' }]}>
                      <ThemedText style={styles.serviceThumbEmoji}>🕉️</ThemedText>
                    </View>
                    <ThemedText style={[styles.serviceLabel, { flex: 1 }, gotra === g && styles.serviceLabelSelected]}>
                      {g}
                    </ThemedText>
                    <View style={styles.serviceCheckWrap}>
                      {gotra === g && (
                        <SymbolView
                          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
                          tintColor={BRAND.primary}
                          size={20}
                        />
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Step 3 — Select Date & Time */}
          {step === 3 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('chooseDateAndTime')}</ThemedText>
              <View style={styles.dateLabelRow}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                  tintColor={BRAND.primary}
                  size={14}
                />
                <ThemedText style={styles.dateLabel}>{t('selectDate')}</ThemedText>
              </View>
              
              <Pressable
                onPress={openDatePicker}
                style={({ pressed }) => [styles.dateSelector, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
                  tintColor={date ? BRAND.primary : BRAND.textSecondary}
                  size={16}
                />
                <ThemedText style={[styles.dateSelectorText, !date && styles.placeholderText]}>
                  {date ? formatDisplayDate(selectedDate) : 'Select Date'}
                </ThemedText>
                <SymbolView
                  name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
                  tintColor={BRAND.textSecondary}
                  size={16}
                />
              </Pressable>
              
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  {/* Quick Date Options */}
                  <View style={styles.quickDateSection}>
                    <ThemedText style={styles.quickDateTitle}>Quick Select</ThemedText>
                    <View style={styles.datePickerGrid}>
                      {generateDateOptions().slice(0, 4).map((dateOption, index) => (
                        <Pressable
                          key={index}
                          onPress={() => selectDateOption(dateOption)}
                          style={({ pressed }) => [
                            styles.dateOption,
                            date === formatDate(dateOption.date) && styles.dateOptionSelected,
                            pressed && styles.pressed,
                          ]}>
                          <ThemedText style={[styles.dateOptionText, date === formatDate(dateOption.date) && styles.dateOptionTextSelected]}>
                            {dateOption.label}
                          </ThemedText>
                          <ThemedText style={[styles.dateOptionDate, date === formatDate(dateOption.date) && styles.dateOptionDateSelected]}>
                            {dateOption.dateText}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                  
                  {/* Calendar */}
                  <View style={styles.calendarSection}>
                    <ThemedText style={styles.calendarTitle}>Select Date</ThemedText>
                    
                    {/* Calendar Header */}
                    <View style={styles.calendarHeader}>
                      <Pressable
                        onPress={goToPreviousMonth}
                        style={({ pressed }) => [styles.calendarNavBtn, pressed && styles.pressed]}>
                        <SymbolView
                          name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                          tintColor={BRAND.primary}
                          size={18}
                        />
                      </Pressable>
                      
                      <ThemedText style={styles.calendarMonthYear}>
                        {currentCalendarDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </ThemedText>
                      
                      <Pressable
                        onPress={goToNextMonth}
                        style={({ pressed }) => [styles.calendarNavBtn, pressed && styles.pressed]}>
                        <SymbolView
                          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                          tintColor={BRAND.primary}
                          size={18}
                        />
                      </Pressable>
                    </View>
                    
                    {/* Days of Week Header */}
                    <View style={styles.calendarDaysHeader}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <ThemedText key={day} style={styles.calendarDayHeaderText}>{day}</ThemedText>
                      ))}
                    </View>
                    
                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                      {getDaysInMonth(currentCalendarDate).map((calendarDate, index) => {
                        if (!calendarDate) {
                          return <View key={`empty-${index}`} style={styles.calendarEmptyDay} />;
                        }
                        
                        const disabled = isDateDisabled(calendarDate);
                        const selected = isDateSelected(calendarDate);
                        
                        return (
                          <Pressable
                            key={index}
                            onPress={() => !disabled && selectCalendarDate(calendarDate)}
                            disabled={disabled}
                            style={({ pressed }) => [
                              styles.calendarDay,
                              selected && styles.calendarDaySelected,
                              disabled && styles.calendarDayDisabled,
                              pressed && !disabled && styles.pressed,
                            ]}>
                            <ThemedText style={[
                              styles.calendarDayText,
                              selected && styles.calendarDayTextSelected,
                              disabled && styles.calendarDayTextDisabled,
                            ]}>
                              {calendarDate.getDate()}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                  
                  <Pressable
                    onPress={() => setShowDatePicker(false)}
                    style={({ pressed }) => [styles.closeDatePicker, pressed && styles.pressed]}>
                    <ThemedText style={styles.closeDatePickerText}>Close</ThemedText>
                  </Pressable>
                </View>
              )}
              
              <ThemedText style={styles.sectionSubtitle}>{t('chooseTime')}</ThemedText>
              <View style={styles.timeGrid}>
                {TIMES.map(tm => (
                  <Pressable
                    key={tm}
                    onPress={() => setTime(tm)}
                    style={({ pressed }) => [
                      styles.timeChip,
                      time === tm && styles.timeChipSelected,
                      pressed && styles.pressed,
                    ]}>
                    <SymbolView
                      name={{ ios: 'clock', android: 'schedule', web: 'schedule' }}
                      tintColor={time === tm ? BRAND.primary : BRAND.textSecondary}
                      size={13}
                    />
                    <ThemedText style={[styles.timeChipText, time === tm && styles.timeChipTextSelected]}>
                      {tm}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Step 4 — Select Panditji */}
          {step === 4 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectPanditji')}</ThemedText>
              {loadingPandits ? (
                <ActivityIndicator size="small" color={BRAND.primary} />
              ) : (
                <View style={{ gap: 10 }}>
                  {pandits.map(p => (
                    <Pressable
                      key={p.PanditId}
                      onPress={() => setPandit(p.PanditId)}
                      style={({ pressed }) => [
                        styles.panditRow,
                        pandit === p.PanditId && styles.panditRowSelected,
                        pressed && styles.pressed,
                      ]}>
                      <View style={styles.panditAvatar}>
                        <SymbolView
                          name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                          tintColor={pandit === p.PanditId ? BRAND.primary : BRAND.textSecondary}
                          size={20}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.panditName, pandit === p.PanditId && styles.panditNameSelected]}>
                          {p.Name}
                        </ThemedText>
                        <ThemedText style={styles.panditMeta}>
                          {p.ExpInYears} · {p.Languages.join(', ')}
                        </ThemedText>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Details Bottom Sheet */}
      <Modal
        visible={showDetailsSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsSheet(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => { Keyboard.dismiss(); setShowDetailsSheet(false); }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrapper}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <View style={styles.sheetHandle} />
              <ThemedText style={styles.sheetTitle}>{t('yourDetails')}</ThemedText>
              <View style={{ gap: 12 }}>
                <View style={{ gap: 6 }}>
                  <ThemedText style={styles.sectionSubtitle}>{t('addressLabel')}</ThemedText>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                    placeholder={t('addressPlaceholder')}
                    placeholderTextColor={BRAND.textSecondary}
                    value={address}
                    onChangeText={setAddress}
                    multiline
                  />
                </View>
                <View style={{ gap: 6 }}>
                  <ThemedText style={styles.sectionSubtitle}>{t('emailLabel')}</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder={t('emailPlaceholder')}
                    placeholderTextColor={BRAND.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
              {!!detailsError && (
                <ThemedText style={styles.sheetError}>{detailsError}</ThemedText>
              )}
              <Pressable
                onPress={onDetailsSubmit}
                disabled={!address || !email || detailsLoading}
                style={({ pressed }) => [
                  styles.cta,
                  { marginTop: 16 },
                  (!address || !email || detailsLoading) && styles.ctaDisabled,
                  pressed && address && email && !detailsLoading && styles.pressed,
                ]}>
                {detailsLoading
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : (
                    <>
                      <ThemedText style={styles.ctaText}>{t('proceedToPayment')}</ThemedText>
                      <SymbolView
                        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                        tintColor="#FFFFFF"
                        size={14}
                      />
                    </>
                  )
                }
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>

      {/* Next button — fixed at bottom */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Pressable
          onPress={onNext}
          disabled={!canProceed}
          style={({ pressed }) => [
            styles.cta,
            !canProceed && styles.ctaDisabled,
            pressed && canProceed && styles.pressed,
          ]}>
          <ThemedText style={styles.ctaText}>{t('next')}</ThemedText>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            tintColor="#FFFFFF"
            size={14}
          />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function Stepper({ current, labels }: { current: number; labels: string[] }) {
  const total = labels.length;
  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperRow}>
        {labels.map((label, i) => {
          const n = i + 1;
          return (
            <View key={n} style={styles.stepperItem}>
              <View style={styles.stepColumn}>
                <View style={[styles.stepCircle, n <= current ? styles.stepCircleActive : styles.stepCircleInactive]}>
                  {n < current ? (
                    <SymbolView
                      name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                      tintColor="#FFFFFF"
                      size={10}
                    />
                  ) : (
                    <ThemedText style={[styles.stepNum, n <= current ? styles.stepNumActive : styles.stepNumInactive]}>
                      {n}
                    </ThemedText>
                  )}
                </View>
                <ThemedText
                  style={[styles.stepLabel, n === current && styles.stepLabelActive]}
                  numberOfLines={2}>
                  {label}
                </ThemedText>
              </View>
              {i < total - 1 && (
                <View style={[styles.stepLine, n < current ? styles.stepLineActive : styles.stepLineInactive]} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.bg },
  header: { paddingBottom: Spacing.three },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: 12,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  stepperContainer: {
    backgroundColor: BRAND.bg,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.three },
  footer: {
    backgroundColor: BRAND.bg,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },

  stepperWrap: { gap: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'flex-start' },
  stepperItem: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  stepColumn: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: { backgroundColor: BRAND.primary },
  stepCircleInactive: { backgroundColor: '#E0D6C2' },
  stepNum: { fontSize: 12, fontWeight: '800' },
  stepNumActive: { color: '#FFFFFF' },
  stepNumInactive: { color: BRAND.textSecondary },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4, marginTop: 14 },
  stepLineActive: { backgroundColor: BRAND.primary },
  stepLineInactive: { backgroundColor: '#E0D6C2' },
  stepLabel: { fontSize: 10, color: BRAND.textSecondary, textAlign: 'center', lineHeight: 12 },
  stepLabelActive: { color: BRAND.primary, fontWeight: '700' },

  card: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: Spacing.three,
    gap: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: BRAND.text },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: BRAND.textSecondary, textTransform: 'uppercase' },
  sectionSubtitle: { fontSize: 14, fontWeight: '700', color: BRAND.text, marginTop: 4 },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  serviceRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  serviceThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFF1DE',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  serviceThumbImg: { width: '100%', height: '100%' },
  serviceThumbEmoji: { fontSize: 22 },
  serviceInfo: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  serviceLabel: { fontSize: 12, fontWeight: '600', color: BRAND.text, lineHeight: 16 },
  serviceLabelSelected: { color: BRAND.primary },
  servicePrice: { fontSize: 12, fontWeight: '700', color: BRAND.textSecondary },
  servicePriceSelected: { color: BRAND.primary },
  serviceCheckWrap: { width: 22, alignItems: 'center', flexShrink: 0 },

  dateLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateLabel: { fontSize: 13, fontWeight: '600', color: BRAND.primary },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  dateSelectorText: { flex: 1, fontSize: 14, color: BRAND.text },
  placeholderText: { color: BRAND.textSecondary },
  datePickerContainer: {
    backgroundColor: BRAND.card,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  quickDateSection: {
    marginBottom: 20,
  },
  quickDateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND.text,
    marginBottom: 10,
  },
  datePickerGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dateOption: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  dateOptionSelected: {
    borderColor: BRAND.primary,
    backgroundColor: BRAND.selectedBg,
  },
  dateOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: BRAND.text,
  },
  dateOptionTextSelected: {
    color: BRAND.primary,
  },
  dateOptionDate: {
    fontSize: 10,
    color: BRAND.textSecondary,
    marginTop: 1,
  },
  dateOptionDateSelected: {
    color: BRAND.primary,
  },
  calendarSection: {
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND.text,
    marginBottom: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND.selectedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthYear: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND.text,
  },
  calendarDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDayHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: BRAND.textSecondary,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarEmptyDay: {
    width: '14.28%',
    height: 36,
  },
  calendarDay: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  calendarDaySelected: {
    backgroundColor: BRAND.primary,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.text,
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
  },
  calendarDayTextDisabled: {
    color: BRAND.textSecondary,
  },
  closeDatePicker: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    marginTop: 8,
    paddingTop: 16,
  },
  closeDatePickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: BRAND.text,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? ({ outlineWidth: 0, outlineStyle: 'none' } as object) : null),
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '47%',
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  timeChipSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  timeChipText: { fontSize: 13, fontWeight: '600', color: BRAND.text },
  timeChipTextSelected: { color: BRAND.primary },

  panditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  panditRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  panditAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0EAE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panditName: { fontSize: 14, fontWeight: '700', color: BRAND.text },
  panditNameSelected: { color: BRAND.primary },
  panditMeta: { fontSize: 11, color: BRAND.textSecondary, marginTop: 2 },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BRAND.primary,
    borderRadius: 12,
    height: 48,
  },
  ctaDisabled: { backgroundColor: BRAND.disabledBg },
  ctaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.85 },

  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheetWrapper: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: BRAND.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.three,
    paddingBottom: 32,
    gap: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND.border,
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: BRAND.text, marginBottom: 4 },
  sheetError: { fontSize: 13, color: '#DC2626', fontWeight: '600', textAlign: 'center' },
});
