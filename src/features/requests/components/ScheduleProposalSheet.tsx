import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

import { Button, Input, Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import { color, radius, shadow } from '@/theme';

export function ScheduleProposalSheet({
  visible,
  title,
  onSubmit,
  onCancel,
  submitting,
}: {
  visible: boolean;
  title: string;
  onSubmit: (iso: string, notes: string) => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    d.setMinutes(0, 0, 0);
    return d;
  });
  const [notes, setNotes] = useState('');
  const [pickerOpen, setPickerOpen] = useState(Platform.OS === 'ios');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        accessibilityLabel={t('common.close')}
        style={{ flex: 1, backgroundColor: 'rgba(22, 22, 19, 0.4)' }}
      />
      <View
        style={[
          {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: color.paper,
            borderTopLeftRadius: radius['3xl'],
            borderTopRightRadius: radius['3xl'],
            padding: 20,
            gap: 16,
          },
          shadow.card,
        ]}
      >
        <Text variant="display/section">{title}</Text>

        <View style={{ gap: 8 }}>
          <Text variant="ui/label-strong">{t('requests.proposedDate')}</Text>
          {Platform.OS === 'android' && !pickerOpen ? (
            <Pressable
              onPress={() => setPickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t('requests.proposedDate')}
              style={{
                minHeight: 48,
                borderWidth: 1,
                borderColor: color.line,
                borderRadius: radius.lg,
                paddingHorizontal: 14,
                justifyContent: 'center',
                backgroundColor: color.paper,
              }}
            >
              <Text variant="body/default">{date.toLocaleString()}</Text>
            </Pressable>
          ) : null}
          {pickerOpen ? (
            <DateTimePicker
              value={date}
              mode="datetime"
              onChange={(event, selected) => {
                if (Platform.OS === 'android') setPickerOpen(false);
                if (event.type === 'set' && selected) setDate(selected);
              }}
              minimumDate={new Date()}
            />
          ) : null}
        </View>

        <Input
          label={t('requests.notesOptional')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 72, textAlignVertical: 'top' }}
        />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button label={t('common.cancel')} variant="secondary" onPress={onCancel} fullWidth />
          <View style={{ flex: 1 }}>
            <Button
              label={t('common.confirm')}
              onPress={() => onSubmit(date.toISOString(), notes)}
              loading={submitting}
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
