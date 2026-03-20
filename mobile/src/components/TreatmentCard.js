import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function TreatmentCard({
  styles,
  treatment,
  onPress,
  getImageUrl,
  formatPrice,
}) {
  const imageUrl = getImageUrl(treatment);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.treatmentCard,
        pressed && styles.tapScaleCard,
      ]}
      onPress={() => onPress(treatment)}
    >
      <View pointerEvents="none" style={styles.treatmentCardGloss} />
      <View pointerEvents="none" style={styles.treatmentCardGlow} />
      <View pointerEvents="none" style={styles.treatmentCardPearl} />
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.treatmentImageReal} />
      ) : (
        <View style={styles.treatmentImageMock} />
      )}
      <View style={styles.treatmentCardBody}>
        <Text style={styles.treatmentName} numberOfLines={1}>{treatment.name}</Text>
        <Text style={styles.treatmentDescription} numberOfLines={2}>
          {treatment.description}
        </Text>
        <Text style={styles.treatmentPrice}>ab {formatPrice(treatment.priceCents)}</Text>
      </View>
    </Pressable>
  );
}
