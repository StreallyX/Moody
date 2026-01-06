// Affiliate Dashboard Component

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAffiliate } from '@/hooks/useAffiliate';
import { Ionicons } from '@expo/vector-icons';

export function AffiliateDashboard() {
  const {
    isAffiliate,
    affiliate,
    stats,
    earnings,
    payoutHistory,
    stripeConnected,
    loading,
    error,
    createCode,
    refreshStats,
    requestPayoutAmount,
    connectStripe,
    minimumPayout,
  } = useAffiliate();

  const [payoutLoading, setPayoutLoading] = useState(false);

  const copyCode = async () => {
    if (affiliate?.code) {
      await Clipboard.setStringAsync(affiliate.code);
      Alert.alert('Copied!', 'Your affiliate code has been copied to clipboard.');
    }
  };

  const handleCreateCode = async () => {
    try {
      await createCode();
      Alert.alert('Success!', 'Your affiliate code has been created.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleConnectStripe = async () => {
    try {
      const url = await connectStripe();
      await Linking.openURL(url);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleRequestPayout = async () => {
    if (!earnings?.available || earnings.available < minimumPayout) {
      Alert.alert('Insufficient Balance', `Minimum payout is $${minimumPayout}`);
      return;
    }

    Alert.alert(
      'Request Payout',
      `Request payout of $${earnings.available.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            setPayoutLoading(true);
            try {
              await requestPayoutAmount(earnings.available);
              Alert.alert('Success', 'Payout request submitted!');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setPayoutLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!isAffiliate) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Become an Affiliate</Text>
          <Text style={styles.emptyText}>
            Share your unique code and earn {((affiliate?.commissionRate || 0.1) * 100).toFixed(0)}% commission on every purchase!
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleCreateCode}>
            <Text style={styles.primaryButtonText}>Create My Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Affiliate Code Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Affiliate Code</Text>
        <TouchableOpacity style={styles.codeContainer} onPress={copyCode}>
          <Text style={styles.codeText}>{affiliate?.code}</Text>
          <Ionicons name="copy-outline" size={24} color="#6366f1" />
        </TouchableOpacity>
        <Text style={styles.hint}>Tap to copy</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalReferrals || 0}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.totalConversions || 0}</Text>
            <Text style={styles.statLabel}>Conversions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {((stats?.conversionRate || 0) * 100).toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Conv. Rate</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Last 30 Days</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.last30DaysReferrals || 0}</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.last30DaysConversions || 0}</Text>
            <Text style={styles.statLabel}>Conversions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              ${(stats?.last30DaysEarnings || 0).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>
      </View>

      {/* Earnings Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Earnings</Text>
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Total Earned</Text>
          <Text style={styles.earningsValue}>${(earnings?.total || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Pending</Text>
          <Text style={styles.earningsValuePending}>${(earnings?.pending || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Available</Text>
          <Text style={styles.earningsValueAvailable}>${(earnings?.available || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.earningsRow}>
          <Text style={styles.earningsLabel}>Paid Out</Text>
          <Text style={styles.earningsValue}>${(earnings?.paid || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Payout Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payouts</Text>
        {!stripeConnected ? (
          <View>
            <Text style={styles.warningText}>
              Connect your Stripe account to receive payouts
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleConnectStripe}>
              <Ionicons name="card-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Connect Stripe</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.successText}>✓ Stripe connected</Text>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!earnings?.available || earnings.available < minimumPayout) && styles.disabledButton,
              ]}
              onPress={handleRequestPayout}
              disabled={payoutLoading || !earnings?.available || earnings.available < minimumPayout}
            >
              {payoutLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Request Payout (${(earnings?.available || 0).toFixed(2)})
                </Text>
              )}
            </TouchableOpacity>
            <Text style={styles.hint}>Minimum payout: ${minimumPayout}</Text>
          </View>
        )}
      </View>

      {/* Payout History */}
      {payoutHistory.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payout History</Text>
          {payoutHistory.map((payout) => (
            <View key={payout.id} style={styles.historyItem}>
              <View>
                <Text style={styles.historyAmount}>${payout.amount.toFixed(2)}</Text>
                <Text style={styles.historyDate}>
                  {payout.requestedAt.toLocaleDateString()}
                </Text>
              </View>
              <View style={[styles.statusBadge, styles[`status_${payout.status}`]]}>
                <Text style={styles.statusText}>{payout.status}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={refreshStats}>
        <Ionicons name="refresh-outline" size={20} color="#6366f1" />
        <Text style={styles.refreshText}>Refresh Stats</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366f1',
    letterSpacing: 2,
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  earningsValuePending: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
  },
  earningsValueAvailable: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  historyDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  status_pending: {
    backgroundColor: '#fef3c7',
  },
  status_processing: {
    backgroundColor: '#dbeafe',
  },
  status_completed: {
    backgroundColor: '#d1fae5',
  },
  status_failed: {
    backgroundColor: '#fee2e2',
  },
  status_cancelled: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  refreshText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
});
