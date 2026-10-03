import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AppText from './AppText';
import Card from './Card';
import AppButton from './AppButton';

export default function BountyCard({ bounty, onOfferHelp }) {
  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <AppText style={styles.typeTag}>{bounty.type}</AppText>
        <View style={styles.timeRow}>
          <Feather name="clock" size={12} color="#A0988F" />
          <AppText style={styles.timeText}>{bounty.duration}</AppText>
        </View>
      </View>

      <View style={styles.titlePriceRow}>
        <AppText variant="heading" style={styles.title}>{bounty.title}</AppText>
        <View style={styles.priceBadge}>
          <AppText style={styles.priceText}>${bounty.price}</AppText>
        </View>
      </View>

      <AppText style={styles.description} numberOfLines={3}>{bounty.description}</AppText>

      {bounty.tags && bounty.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {bounty.tags.map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <AppText style={styles.tagText}>{tag}</AppText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.userRow}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{bounty.user.name.charAt(0)}</AppText>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <AppText style={styles.userName}>{bounty.user.name}</AppText>
            {bounty.user.verified && (
              <View style={styles.verifiedTick}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>
          <AppText style={styles.userRole}>{bounty.user.role}</AppText>
        </View>
        <AppButton 
          title="Offer Help" 
          onPress={() => onOfferHelp && onOfferHelp(bounty)} 
          style={styles.offerButton}
          textStyle={styles.offerButtonText}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A0988F',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: '#666666',
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    lineHeight: 28,
  },
  priceBadge: {
    backgroundColor: '#FBEBE6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C05C41',
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#FAF8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8E2D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  verifiedTick: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#C05C41',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userRole: {
    fontSize: 13,
    color: '#A0988F',
  },
  offerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  offerButtonText: {
    fontSize: 14,
  }
});
