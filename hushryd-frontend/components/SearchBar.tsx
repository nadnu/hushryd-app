import React, { useEffect, useState } from 'react';
import { Image as RNImage, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Images from '../assets/images';
import Colors from '../constants/Colors';
import { BorderRadius, FontSizes, Shadows, Spacing } from '../constants/Design';
import { SearchParams } from '../types/models';
import Button from './Button';
import DatePicker from './DatePicker';
import LocationAutocomplete from './LocationAutocomplete';
import TimeSlotDropdown from './TimeSlotDropdown';
import { useColorScheme } from './useColorScheme';

const IS_WEB = Platform.OS === 'web';

const TIMESLOT_OPTIONS = [
  { key: 'any', label: 'Any', icon: '🕐' },
  { key: 'early-morning', label: '4-7AM', icon: '🌄' },
  { key: 'morning', label: '7-10AM', icon: '🌅' },
  { key: 'late-morning', label: '10-1PM', icon: '☀️' },
  { key: 'afternoon', label: '1-4PM', icon: '🌞' },
  { key: 'evening', label: '4-7PM', icon: '🌆' },
  { key: 'late-evening', label: '7-10PM', icon: '🌇' },
  { key: 'night', label: '10-1AM', icon: '🌙' },
] as const;

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  initialValues?: Partial<SearchParams>;
  compact?: boolean;
}

export default function SearchBar({ onSearch, initialValues, compact = false }: SearchBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [from, setFrom] = useState(initialValues?.from || '');
  const [to, setTo] = useState(initialValues?.to || '');
  const [date, setDate] = useState(initialValues?.date || getTodayDate());
  const [passengers, setPassengers] = useState(initialValues?.passengers || 1);
  const [timeslot, setTimeslot] = useState<(typeof TIMESLOT_OPTIONS)[number]['key']>(initialValues?.timeslot || 'any');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeSlotDropdown, setShowTimeSlotDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(initialValues?.date || getTodayDate()));

  const handleSearch = () => {
    if (from && to && date) {
      onSearch({ from, to, date, passengers, timeslot });
    }
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleTimeslotSelect = (selectedTimeslot: string) => {
    setTimeslot(selectedTimeslot as (typeof TIMESLOT_OPTIONS)[number]['key']);
    setShowTimeSlotDropdown(false);
  };

  const handleReset = () => {
    setFrom(initialValues?.from || '');
    setTo('');
    setDate(getTodayDate());
    setSelectedDate(new Date());
    setPassengers(1);
    setTimeslot('any');
    setShowTimeSlotDropdown(false);
  };

  const handleDatePress = () => {
    setShowTimeSlotDropdown(false);
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, pickedDate?: Date) => {
    const currentDate = pickedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    setDate(currentDate.toISOString().split('T')[0]);
  };

  const formatDateDisplay = (value: string) => {
    const inputDate = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    const tomorrow = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (inputDate.toDateString() === today.toDateString()) return 'Today';
    if (inputDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
    if (inputDate.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return inputDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: inputDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  useEffect(() => {
    if (initialValues?.date) {
      setDate(initialValues.date);
      setSelectedDate(new Date(initialValues.date));
    }
  }, [initialValues?.date]);

  const renderWebLayout = () => (
    <View style={styles.webCard}>
      <RNImage
        source={Images.searchBanner}
        style={styles.backgroundImage}
        resizeMode="cover"
        onError={() => {
          console.log('Search bar background image failed to load');
        }}
      />
      <View style={styles.contentOverlay}>
        <View style={styles.mainRow}>
          <View style={styles.firstRow}>
            <View style={styles.inputWrapper}>
              <LocationAutocomplete
                placeholder="From"
                value={from}
                onLocationSelect={setFrom}
                icon={<Text style={styles.inputIcon}>📍</Text>}
              />
            </View>

            <TouchableOpacity
              style={[styles.swapButton, { backgroundColor: colors.primary }]}
              onPress={swapLocations}
            >
              <Text style={styles.swapIcon}>⇅</Text>
            </TouchableOpacity>

            <View style={styles.inputWrapper}>
              <LocationAutocomplete
                placeholder="To"
                value={to}
                onLocationSelect={setTo}
                icon={<Text style={styles.inputIcon}>🎯</Text>}
              />
            </View>

            <View style={styles.dateWrapper}>
              <TouchableOpacity
                style={[styles.dateInput, { backgroundColor: colors.lightGray, borderColor: colors.border }]}
                onPress={handleDatePress}
              >
                <Text style={styles.inputIcon}>📅</Text>
                <Text style={[styles.dateText, { color: colors.text }]}>{formatDateDisplay(date)}</Text>
                <TouchableOpacity
                  style={styles.timeSlotTrigger}
                  onPress={() => setShowTimeSlotDropdown(!showTimeSlotDropdown)}
                >
                  <Text style={styles.timeSlotIcon}>⏰</Text>
                </TouchableOpacity>
              </TouchableOpacity>

              <TimeSlotDropdown
                selectedTimeslot={timeslot}
                onTimeslotSelect={handleTimeslotSelect}
                visible={showTimeSlotDropdown}
              />
            </View>

            <View style={styles.passengerWrapper}>
              <View
                style={[
                  styles.passengerControl,
                  { backgroundColor: colors.lightGray, borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={styles.passengerButton}
                  onPress={() => setPassengers(Math.max(1, passengers - 1))}
                >
                  <Text style={[styles.passengerButtonText, { color: colors.text }]}>−</Text>
                </TouchableOpacity>
                <View style={styles.passengerDisplay}>
                  <Text style={[styles.passengerText, { color: colors.text }]}>{passengers}</Text>
                </View>
                <TouchableOpacity
                  style={styles.passengerButton}
                  onPress={() => setPassengers(Math.min(8, passengers + 1))}
                >
                  <Text style={[styles.passengerButtonText, { color: colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.secondRow}>
            <View style={styles.timeslotContainer}>
              <Text style={[styles.timeslotLabel, { color: colors.textSecondary }]}>Time</Text>
              <View style={styles.timeslotButtons}>
                {TIMESLOT_OPTIONS.map((slot) => (
                  <TouchableOpacity
                    key={slot.key}
                    style={[
                      styles.timeslotButton,
                      { backgroundColor: colors.lightGray, borderColor: colors.border },
                      timeslot === slot.key && [
                        styles.timeslotButtonActive,
                        { backgroundColor: colors.primary, borderColor: colors.primary },
                      ],
                    ]}
                    onPress={() => setTimeslot(slot.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeslotIcon}>{slot.icon}</Text>
                    <Text
                      style={[
                        styles.timeslotText,
                        { color: colors.text },
                        timeslot === slot.key && { color: '#FFFFFF' },
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Button
              title="Reset"
              onPress={handleReset}
              variant="outline"
              size="medium"
              style={styles.resetButton}
            />

            <Button
              title="Search"
              onPress={handleSearch}
              variant="outline"
              size="medium"
              style={styles.searchButton}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const renderMobileLayout = () => (
    <View style={styles.mobileLayout}>
      <Text style={[styles.mobileTitle, { color: colors.text }]}>Plan your ride</Text>

      <View style={styles.mobileFieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>From</Text>
        <LocationAutocomplete
          placeholder="Leaving from"
          value={from}
          onLocationSelect={setFrom}
        />
      </View>

      <View style={styles.mobileFieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>To</Text>
        <LocationAutocomplete
          placeholder="Going to"
          value={to}
          onLocationSelect={setTo}
        />
      </View>

      <TouchableOpacity
        style={[styles.mobileDateInput, { backgroundColor: colors.lightGray, borderColor: colors.border }]}
        onPress={handleDatePress}
      >
        <Text style={styles.inputIcon}>📅</Text>
        <Text style={[styles.dateText, { color: colors.text }]}>{formatDateDisplay(date)}</Text>
      </TouchableOpacity>

      <View style={styles.mobileTimeslotSection}>
        <Text style={[styles.timeslotLabel, { color: colors.textSecondary }]}>Pick a time slot</Text>
        <View style={styles.mobileTimeslotChips}>
          {TIMESLOT_OPTIONS.map((slot) => (
            <TouchableOpacity
              key={slot.key}
              style={[
                styles.mobileTimeslotChip,
                { borderColor: colors.border },
                timeslot === slot.key && [
                  styles.mobileTimeslotChipActive,
                  { backgroundColor: colors.primary, borderColor: colors.primary },
                ],
              ]}
              onPress={() => setTimeslot(slot.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.mobileTimeslotChipText,
                  { color: colors.text },
                  timeslot === slot.key && { color: '#FFFFFF' },
                ]}
              >
                {slot.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.mobilePassengersCard}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Seats</Text>
        <View style={[styles.mobilePassengersControl, { borderColor: colors.border, backgroundColor: colors.lightGray }]}>
          <TouchableOpacity
            style={styles.mobilePassengersButton}
            onPress={() => setPassengers(Math.max(1, passengers - 1))}
          >
            <Text style={[styles.mobilePassengersButtonText, { color: colors.text }]}>−</Text>
          </TouchableOpacity>
          <View style={styles.mobilePassengersValue}>
            <Text style={[styles.mobilePassengersText, { color: colors.text }]}>{passengers}</Text>
          </View>
          <TouchableOpacity
            style={styles.mobilePassengersButton}
            onPress={() => setPassengers(Math.min(8, passengers + 1))}
          >
            <Text style={[styles.mobilePassengersButtonText, { color: colors.text }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mobileActions}>
        <Button
          title="Search rides"
          onPress={handleSearch}
          variant="primary"
          size="large"
          style={styles.mobileSearchButton}
        />
        <TouchableOpacity onPress={handleReset} style={styles.clearButton}>
          <Text style={[styles.clearButtonText, { color: colors.primary }]}>Clear search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <View style={[styles.searchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {IS_WEB ? renderWebLayout() : renderMobileLayout()}
      </View>

      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.calendarModal, { backgroundColor: colors.card }]}> 
            <View style={styles.calendarHeader}>
              <Text style={[styles.calendarTitle, { color: colors.text }]}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(pickedDate) => {
                setSelectedDate(pickedDate);
                setDate(pickedDate.toISOString().split('T')[0]);
              }}
              minimumDate={new Date()}
              placeholder="Select date"
              showLabel={true}
            />

            <View style={styles.calendarFooter}>
              <Button
                title="Cancel"
                onPress={() => setShowDatePicker(false)}
                variant="outline"
                size="medium"
                style={styles.cancelButton}
              />
              <Button
                title="Select"
                onPress={() => setShowDatePicker(false)}
                size="medium"
                style={styles.selectButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  compactContainer: {
    padding: Spacing.md,
  },
  searchCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadows.medium,
    overflow: 'hidden',
  },
  webCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  contentOverlay: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: IS_WEB ? 'rgba(255, 255, 255, 0.85)' : '#FFFFFF',
    padding: Spacing.md,
  },
  mainRow: {
    flexDirection: 'column',
    gap: Spacing.md,
  },
  firstRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flexWrap: 'nowrap',
    zIndex: 200,
  },
  secondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'nowrap',
  },
  inputWrapper: {
    width: 250,
    position: 'relative',
  },
  dateWrapper: {
    width: 250,
    position: 'relative',
    zIndex: 50,
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
    alignSelf: 'center',
  },
  swapIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inputIcon: {
    fontSize: 16,
  },
  passengerWrapper: {
    width: 250,
  },
  passengerControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    height: 52,
  },
  passengerButton: {
    width: 32,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  passengerDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerText: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  timeslotContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  timeslotLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  timeslotButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  timeslotButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 52,
    minWidth: 80,
  },
  timeslotButtonActive: {
    borderWidth: 2,
  },
  timeslotIcon: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  timeslotText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  resetButton: {
    minWidth: 120,
    minHeight: 52,
  },
  searchButton: {
    minWidth: 120,
    minHeight: 52,
  },
  mobileLayout: {
    gap: Spacing.lg,
  },
  mobileTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  mobileFieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  mobileDateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    height: 52,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  mobileTimeslotSection: {
    gap: Spacing.sm,
  },
  mobileTimeslotChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mobileTimeslotChip: {
    borderWidth: 1,
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  mobileTimeslotChipActive: {
    borderWidth: 2,
  },
  mobileTimeslotChipText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  mobilePassengersCard: {
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  mobilePassengersControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    height: 52,
  },
  mobilePassengersButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobilePassengersButtonText: {
    fontSize: 20,
    fontWeight: '700',
  },
  mobilePassengersValue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobilePassengersText: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  mobileActions: {
    gap: Spacing.sm,
  },
  mobileSearchButton: {
    width: '100%',
  },
  clearButton: {
    alignSelf: 'center',
  },
  clearButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    width: '90%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    minHeight: 400,
    ...Shadows.large,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  calendarTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  calendarFooter: {
    flexDirection: IS_WEB ? 'row' : 'column',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    ...(IS_WEB ? {} : { width: '100%' }),
  },
  selectButton: {
    flex: 1,
    ...(IS_WEB ? {} : { width: '100%' }),
  },
});
