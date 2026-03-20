import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function TreatmentCard({
  styles,
  treatment,
  onPress,
  getImageUrl,
  formatPrice,
  featured = false,
}) {
  const imageUrl = getImageUrl(treatment);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.treatmentCard,
        featured && styles.treatmentCardFeatured,
        pressed && styles.tapScaleCard,
      ]}
      onPress={() => onPress(treatment)}
    >
      <View pointerEvents="none" style={styles.treatmentCardGloss} />
      <View pointerEvents="none" style={styles.treatmentCardGlow} />
      <View pointerEvents="none" style={styles.treatmentCardPearl} />
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[styles.treatmentImageReal, featured && styles.treatmentImageFeatured]} />
      ) : (
        <View style={[styles.treatmentImageMock, featured && styles.treatmentImageFeatured]} />
      )}
      <View style={styles.treatmentCardBody}>
        <View style={styles.treatmentMetaRow}>
          <Text style={styles.treatmentMetaPill}>{treatment.durationMinutes} Min</Text>
        </View>
        <Text style={styles.treatmentName} numberOfLines={1}>{treatment.name}</Text>
        <Text style={[styles.treatmentDescription, featured && styles.treatmentDescriptionFeatured]} numberOfLines={featured ? 3 : 2}>
          {treatment.description}
        </Text>
        <Text style={styles.treatmentPrice}>ab {formatPrice(treatment.priceCents)}</Text>
      </View>
    </Pressable>
  );
}
