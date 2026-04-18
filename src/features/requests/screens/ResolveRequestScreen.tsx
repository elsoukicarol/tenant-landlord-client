import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  View,
} from 'react-native';
import { z } from 'zod';

import { isApiError } from '@/api/errors';
import { Banner, Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/lib/i18n';
import type { MaintainerRequestsStackParamList } from '@/navigation/types';
import { color, radius } from '@/theme';

import { useResolveRequest } from '../api';
import { MAX_PHOTO_BYTES, MAX_PHOTOS, type PickedPhoto } from '../components/PhotoPickerField';

type RouteT = RouteProp<MaintainerRequestsStackParamList, 'MaintainerResolveRequest'>;

const schema = z.object({
  notes: z.string().trim().min(20, 'requests.resolveNotesTooShort'),
});
type FormInput = z.infer<typeof schema>;

type PickedPdf = { uri: string; name: string; type: string; size: number };

export function ResolveRequestScreen() {
  const route = useRoute<RouteT>();
  const navigation = useNavigation();
  const { id } = route.params;
  const resolve = useResolveRequest();

  const [evidence, setEvidence] = useState<PickedPhoto[]>([]);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [autoGeneratePdf, setAutoGeneratePdf] = useState(true);
  const [customPdf, setCustomPdf] = useState<PickedPdf | null>(null);

  const { control, handleSubmit } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { notes: '' },
    mode: 'onBlur',
  });

  const pickEvidence = async () => {
    setEvidenceError(null);
    if (evidence.length >= MAX_PHOTOS) {
      setEvidenceError(t('requests.photoMaxCount', { max: MAX_PHOTOS }));
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        t('requests.photoPermissionNeededTitle'),
        t('requests.photoPermissionNeededBody'),
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - evidence.length,
      quality: 0.85,
    });
    if (result.canceled) return;
    const next: PickedPhoto[] = [];
    const rejected: string[] = [];
    for (const a of result.assets) {
      if ((a.fileSize ?? 0) > MAX_PHOTO_BYTES) {
        rejected.push(a.fileName ?? 'photo');
        continue;
      }
      next.push({
        uri: a.uri,
        name: a.fileName ?? `evidence-${Date.now()}.jpg`,
        type: a.mimeType ?? 'image/jpeg',
        size: a.fileSize ?? 0,
      });
    }
    if (rejected.length > 0) {
      setEvidenceError(t('requests.photoTooLarge', { count: rejected.length }));
    }
    if (next.length > 0) setEvidence([...evidence, ...next]);
  };

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset) return;
    if ((asset.size ?? 0) > MAX_PHOTO_BYTES) {
      setEvidenceError(t('requests.photoTooLarge', { count: 1 }));
      return;
    }
    setCustomPdf({
      uri: asset.uri,
      name: asset.name,
      type: asset.mimeType ?? 'application/pdf',
      size: asset.size ?? 0,
    });
  };

  const onSubmit = handleSubmit((values) => {
    const uploads: { uri: string; name: string; type: string }[] = evidence.map((e) => ({
      uri: e.uri,
      name: e.name,
      type: e.type,
    }));
    if (!autoGeneratePdf && customPdf) {
      uploads.push({ uri: customPdf.uri, name: customPdf.name, type: customPdf.type });
    }
    resolve.mutate(
      {
        id,
        notes: values.notes,
        evidence: uploads,
        autoGeneratePdf,
      },
      {
        onSuccess: () => navigation.goBack(),
      },
    );
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ gap: 20, paddingBottom: 40 }}>
          <Text variant="display/screen-title">{t('requests.resolve')}</Text>

          {resolve.isError && isApiError(resolve.error) ? (
            <Banner tone="danger" message={resolve.error.message} />
          ) : null}

          <Controller
            control={control}
            name="notes"
            render={({ field, fieldState }) => (
              <Input
                label={t('requests.notes')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                multiline
                numberOfLines={5}
                style={{ minHeight: 110, textAlignVertical: 'top' }}
                editable={!resolve.isPending}
                hint={t('requests.resolveNotesHint')}
                error={fieldState.error ? t(fieldState.error.message ?? '') : undefined}
              />
            )}
          />

          <View style={{ gap: 8 }}>
            <Text variant="ui/label-strong">{t('requests.evidenceLabel')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {evidence.map((e, i) => (
                <View
                  key={e.uri}
                  style={{
                    padding: 8,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    borderColor: color.line,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Text variant="ui/caption">{e.name}</Text>
                  <Pressable
                    onPress={() => setEvidence(evidence.filter((_, idx) => idx !== i))}
                    accessibilityRole="button"
                    accessibilityLabel="Remove evidence"
                    hitSlop={8}
                  >
                    <Text variant="ui/label" style={{ color: color.danger }}>
                      ×
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
            <Pressable
              onPress={pickEvidence}
              accessibilityRole="button"
              accessibilityLabel={t('requests.addPhoto')}
              style={{
                borderRadius: radius.lg,
                borderWidth: 1,
                borderStyle: 'dashed',
                borderColor: color.line,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 56,
              }}
            >
              <Text variant="ui/label">{t('requests.addEvidence')}</Text>
            </Pressable>
            {evidenceError ? (
              <Text variant="ui/caption" style={{ color: color.danger }}>
                {evidenceError}
              </Text>
            ) : null}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              minHeight: 44,
            }}
          >
            <Switch
              value={autoGeneratePdf}
              onValueChange={setAutoGeneratePdf}
              accessibilityLabel={t('requests.autoGeneratePdf')}
              trackColor={{ false: color.line, true: color.accent }}
            />
            <View style={{ flex: 1 }}>
              <Text variant="ui/label-strong">{t('requests.autoGeneratePdf')}</Text>
              <Text variant="body/small">{t('requests.autoGeneratePdfHint')}</Text>
            </View>
          </View>

          {!autoGeneratePdf ? (
            <View style={{ gap: 8 }}>
              <Text variant="ui/label-strong">{t('requests.uploadCustomPdf')}</Text>
              <Pressable
                onPress={pickPdf}
                accessibilityRole="button"
                accessibilityLabel={t('requests.uploadCustomPdf')}
                style={{
                  borderRadius: radius.lg,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: color.line,
                  padding: 16,
                  alignItems: 'center',
                  minHeight: 56,
                  justifyContent: 'center',
                }}
              >
                <Text variant="ui/label">
                  {customPdf ? customPdf.name : t('requests.selectPdf')}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <Button
            label={t('requests.markResolved')}
            onPress={onSubmit}
            loading={resolve.isPending}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
