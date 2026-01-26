/**
 * ModeUnlockModal - Popup pour débloquer un mode de jeu
 * Uses react-native-iap for real purchases
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { Modal } from './ui';
import { colors, spacing, borderRadius } from '../theme';
import { haptics } from '../utils/haptics';
import {
  purchaseProduct,
  getProduct,
  PRODUCT_IDS,
  Product,
} from '../services/iapService';
import { grantModeAccess } from '../lib/auth';

interface ModeConfig {
  id: string;
  productId: string;
  fallbackPrice: string;
  icon: string;
  color: string;
}

const MODE_CONFIGS: Record<string, ModeConfig> = {
  couples: {
    id: 'couples',
    productId: PRODUCT_IDS.COUPLES,
    fallbackPrice: '4,99 €',
    icon: 'heart',
    color: '#FF4D6A',
  },
  caliente: {
    id: 'caliente',
    productId: PRODUCT_IDS.CALIENTE,
    fallbackPrice: '4,99 €',
    icon: 'fire',
    color: '#FF6B35',
  },
};

interface ModeUnlockModalProps {
  visible: boolean;
  onClose: () => void;
  modeId: string;
  onSuccess?: () => void;
}

export default function ModeUnlockModal({
  visible,
  onClose,
  modeId,
  onSuccess,
}: ModeUnlockModalProps) {
  const { t } = useTranslation();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const modeConfig = MODE_CONFIGS[modeId];

  // Load product info when modal opens
  useEffect(() => {
    if (visible && modeConfig) {
      setLoadingProduct(true);
      setError(null);
      setSuccess(false);

      getProduct(modeConfig.productId)
        .then(p => {
          setProduct(p);
          setLoadingProduct(false);
        })
        .catch(err => {
          console.error('Error loading product:', err);
          setLoadingProduct(false);
        });
    }
  }, [visible, modeId]);

  if (!modeConfig) {
    return null;
  }

  // Get price from store or fallback
  const displayPrice = product?.localizedPrice || modeConfig.fallbackPrice;

  // Get translated content
  const modeName = t(`unlock.${modeId}.name`);
  const modeDescription = t(`unlock.${modeId}.description`);
  const features = [
    t(`unlock.${modeId}.feature1`),
    t(`unlock.${modeId}.feature2`),
    t(`unlock.${modeId}.feature3`),
    t(`unlock.${modeId}.feature4`),
  ];

  const handlePurchase = async () => {
    setError(null);
    setIsPurchasing(true);
    haptics.lightTap();

    try {
      // Real purchase with react-native-iap
      const result = await purchaseProduct(modeConfig.productId);

      if (result.cancelled) {
        // User cancelled - just close without error
        setIsPurchasing(false);
        return;
      }

      if (!result.success) {
        throw new Error(result.error || t('unlock.error'));
      }

      // Grant local access
      await grantModeAccess(modeId);

      setSuccess(true);
      haptics.success();

      // Close after 1.5s
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);

    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(err.message || t('unlock.error'));
      haptics.warning();
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleClose = () => {
    if (!isPurchasing) {
      haptics.lightTap();
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      closeOnBackdrop={!isPurchasing}
      showCloseButton={!isPurchasing && !success}
    >
      {success ? (
        // Success State
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.successContainer}
        >
          <View style={[styles.successIcon, { backgroundColor: modeConfig.color + '20' }]}>
            <Icon name="check" size={40} color={modeConfig.color} />
          </View>
          <Text style={styles.successTitle}>{t('unlock.unlocked')}</Text>
          <Text style={styles.successText}>
            {t('unlock.nowAvailable', { mode: modeName })}
          </Text>
        </Animated.View>
      ) : (
        // Purchase State
        <View style={styles.container}>
          {/* Header avec icône */}
          <View style={[styles.iconContainer, { backgroundColor: modeConfig.color + '20' }]}>
            {modeConfig.icon === 'fire' ? (
              <MaterialCommunityIcons name="fire" size={48} color={modeConfig.color} />
            ) : (
              <Icon name={modeConfig.icon} size={40} color={modeConfig.color} />
            )}
          </View>

          {/* Titre */}
          <Text style={[styles.title, { color: modeConfig.color }]}>
            {modeName}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {modeDescription}
          </Text>

          {/* Features */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Icon name="check" size={14} color={modeConfig.color} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Prix */}
          <View style={[styles.priceContainer, { borderColor: modeConfig.color }]}>
            <Text style={styles.priceLabel}>{t('unlock.oneTimePurchase')}</Text>
            {loadingProduct ? (
              <ActivityIndicator size="small" color={modeConfig.color} />
            ) : (
              <Text style={[styles.price, { color: modeConfig.color }]}>
                {displayPrice}
              </Text>
            )}
          </View>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeIn} style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          )}

          {/* Bouton d'achat */}
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              { backgroundColor: modeConfig.color },
              (isPurchasing || loadingProduct) && styles.purchaseButtonDisabled,
            ]}
            onPress={handlePurchase}
            disabled={isPurchasing || loadingProduct}
            activeOpacity={0.8}
          >
            {isPurchasing ? (
              <ActivityIndicator color={colors.text.primary} size="small" />
            ) : (
              <>
                <Icon name="unlock" size={18} color={colors.text.primary} />
                <Text style={styles.purchaseButtonText}>
                  {t('unlock.unlockFor', { price: displayPrice })}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Note légale */}
          <Text style={styles.legalText}>
            {t('unlock.noSubscription')}
          </Text>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  description: {
    color: colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing[4],
    paddingHorizontal: spacing[2],
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  featureText: {
    color: colors.text.primary,
    fontSize: 14,
    marginLeft: spacing[3],
  },
  priceContainer: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    marginBottom: spacing[4],
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  priceLabel: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginBottom: spacing[1],
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
  },
  errorContainer: {
    backgroundColor: colors.semantic.error + '20',
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
    width: '100%',
  },
  errorText: {
    color: colors.semantic.error,
    fontSize: 14,
    textAlign: 'center',
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.xl,
    width: '100%',
    gap: spacing[2],
    // Glow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  legalText: {
    color: colors.text.tertiary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing[3],
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  successText: {
    color: colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
