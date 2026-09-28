import AppText from '../components/AppText';
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function CustomModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  onConfirm,
  confirmText,
  isConfirming,
  confirmDisabled
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <AppText style={styles.modalTitle}>{title}</AppText>
          {subtitle ? <AppText style={styles.modalSubtitle}>{subtitle}</AppText> : null}
          
          {children}
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onClose}
              disabled={isConfirming}
            >
              <AppText style={styles.cancelBtnText}>Cancel</AppText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={onConfirm}
              disabled={confirmDisabled || isConfirming}
            >
              {isConfirming ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <AppText style={styles.submitBtnText}>{confirmText}</AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#EBE6DA',
  },
  modalTitle: {
    color: '#111111',
    fontSize: 24,
    
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#666666',
    fontSize: 18,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelBtnText: {
    color: '#666666',
    
    fontSize: 20,
  },
  submitBtn: {
    backgroundColor: '#deb785',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    
    fontSize: 20,
  }
});
