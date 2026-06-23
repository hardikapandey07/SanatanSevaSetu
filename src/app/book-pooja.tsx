import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
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

const SERVICES: { key: TranslationKey; price: string }[] = [
  { key: 'satyanarayanPuja', price: '₹1,100' },
  { key: 'grihaPravesh', price: '₹2,100' },
  { key: 'weddingCeremony', price: '₹5,100' },
  { key: 'abhishek', price: '₹700' },
  { key: 'havan', price: '₹3,100' },
];

const PANDITS: { key: TranslationKey; price: string; exp: string }[] = [
  { key: 'panditRameshSharma', price: '₹1,500', exp: '15 yrs' },
  { key: 'panditSureshKumar', price: '₹1,200', exp: '10 yrs' },
  { key: 'shriRamMandir', price: '₹2,000', exp: '25 yrs' },
  { key: 'kashiVishwanath', price: '₹2,500', exp: '30 yrs' },
];

const TIMES = ['6:00 AM', '8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM'];

const STEP_LABELS: TranslationKey[] = ['selectService', 'chooseDateTime', 'selectPanditji', 'payment'];

export default function BookPoojaScreen() {
  const t = useT();
  const [step, setStep] = useState(1);
  const [service, setService] = useState<TranslationKey>('satyanarayanPuja');
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState('');
  const [pandit, setPandit] = useState<TranslationKey | ''>('');

  const canProceed =
    (step === 1 && !!service) ||
    (step === 2 && !!date && !!time) ||
    (step === 3 && !!pandit);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
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
    calendarDate.setHours(0, 0, 0, 0);
    return calendarDate < today;
  };
  
  const isDateSelected = (calendarDate: Date) => {
    if (!date) return false;
    return formatDate(calendarDate) === date;
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const onNext = () => {
    if (!canProceed) return;
    if (step < 3) { setStep(step + 1); return; }
    router.push({
      pathname: '/payment',
      params: { service: service as string, provider: pandit, date, time },
    });
  };

  const onBack = () => {
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Stepper current={step} labels={STEP_LABELS.map(k => t(k))} />

        <View style={styles.card}>
          {/* Step 1 — Select Puja */}
          {step === 1 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectService')}</ThemedText>
              <View style={{ gap: 10 }}>
                {SERVICES.map(s => (
                  <Pressable
                    key={s.key}
                    onPress={() => setService(s.key)}
                    style={({ pressed }) => [
                      styles.serviceRow,
                      service === s.key && styles.serviceRowSelected,
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={[styles.serviceLabel, service === s.key && styles.serviceLabelSelected]}>
                      {t(s.key)}
                    </ThemedText>
                    <ThemedText style={[styles.servicePrice, service === s.key && styles.servicePriceSelected]}>
                      {s.price}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Step 2 — Select Date & Time */}
          {step === 2 && (
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

          {/* Step 3 — Select Panditji with Pricing */}
          {step === 3 && (
            <>
              <ThemedText style={styles.sectionTitle}>{t('selectPanditji')}</ThemedText>
              <View style={{ gap: 10 }}>
                {PANDITS.map(p => (
                  <Pressable
                    key={p.key}
                    onPress={() => setPandit(p.key)}
                    style={({ pressed }) => [
                      styles.panditRow,
                      pandit === p.key && styles.panditRowSelected,
                      pressed && styles.pressed,
                    ]}>
                    <View style={styles.panditAvatar}>
                      <SymbolView
                        name={{ ios: 'person.fill', android: 'person', web: 'person' }}
                        tintColor={pandit === p.key ? BRAND.primary : BRAND.textSecondary}
                        size={20}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.panditName, pandit === p.key && styles.panditNameSelected]}>
                        {t(p.key)}
                      </ThemedText>
                      <ThemedText style={styles.panditExp}>{t('experienceLabel')}: {p.exp}</ThemedText>
                    </View>
                    <ThemedText style={[styles.panditPrice, pandit === p.key && styles.panditPriceSelected]}>
                      {p.price}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>

        <Pressable
          onPress={onNext}
          disabled={!canProceed}
          style={({ pressed }) => [
            styles.cta,
            !canProceed && styles.ctaDisabled,
            pressed && canProceed && styles.pressed,
          ]}>
          <ThemedText style={styles.ctaText}>
            {step === 3 ? t('proceedToPayment') : t('next')}
          </ThemedText>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            tintColor="#FFFFFF"
            size={14}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stepper({ current, labels }: { current: number; labels: string[] }) {
  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperRow}>
        {[1, 2, 3, 4].map((n, i) => (
          <View key={n} style={styles.stepperItem}>
            <View style={styles.stepColumn}>
              <View style={[styles.stepCircle, n <= current ? styles.stepCircleActive : styles.stepCircleInactive]}>
                {n < current ? (
                  <SymbolView
                    name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                    tintColor="#FFFFFF"
                    size={12}
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
                {labels[i] || ''}
              </ThemedText>
            </View>
            {i < 3 && (
              <View style={[styles.stepLine, n < current ? styles.stepLineActive : styles.stepLineInactive]} />
            )}
          </View>
        ))}
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
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.three, paddingBottom: Spacing.five, gap: Spacing.three },

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
  sectionSubtitle: { fontSize: 14, fontWeight: '700', color: BRAND.text, marginTop: 4 },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BRAND.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  serviceRowSelected: { borderColor: BRAND.primary, backgroundColor: BRAND.selectedBg },
  serviceLabel: { fontSize: 14, fontWeight: '600', color: BRAND.text },
  serviceLabelSelected: { color: BRAND.primary },
  servicePrice: { fontSize: 13, fontWeight: '700', color: BRAND.textSecondary },
  servicePriceSelected: { color: BRAND.primary },

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
  panditExp: { fontSize: 11, color: BRAND.textSecondary, marginTop: 2 },
  panditPrice: { fontSize: 15, fontWeight: '800', color: BRAND.textSecondary },
  panditPriceSelected: { color: BRAND.primary },

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
});
