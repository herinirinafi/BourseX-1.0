import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../contexts/I18nContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const SettingsScreen = () => {
  const { t } = useI18n();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(false);

  const handleClearCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      Alert.alert(t('common.success'), t('success.cacheCleared'));
    } catch (error) {
      console.error('Error clearing cache:', error);
      Alert.alert(t('common.error'), t('error.failedToClear'));
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { text: t('settings.logout'), style: 'destructive', onPress: () => console.log('User logged out') },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange = () => {},
    isLast = false
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    isLast?: boolean;
  }) => (
    <>
      <TouchableOpacity 
        style={[styles.settingItem, isLast && styles.lastSettingItem]}
        onPress={onPress}
        disabled={showSwitch}
      >
        <View style={styles.settingIconContainer}>
          <MaterialIcons name={icon as any} size={24} color="#007AFF" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={switchValue ? '#007AFF' : '#f4f3f4'}
          />
        ) : (
          <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
        )}
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon="dark-mode"
            title={t('settings.darkMode')}
            description={t('settings.darkModeDesc')}
            showSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="notifications"
            title={t('settings.notifications')}
            description={t('settings.notificationsDesc')}
            showSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="fingerprint"
            title={t('settings.biometric')}
            description={t('settings.biometricDesc')}
            showSwitch
            switchValue={biometricAuth}
            onSwitchChange={setBiometricAuth}
            isLast
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon="person"
            title={t('settings.editProfile')}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <LanguageSwitcher />
          <View style={styles.divider} />
          <SettingItem
            icon="lock"
            title={t('settings.changePassword')}
            onPress={() => {}}
            isLast
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.support')}</Text>
        <View style={styles.sectionContent}>
          <SettingItem
            icon="help"
            title={t('settings.helpCenter')}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="email"
            title={t('settings.contactUs')}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="info"
            title={t('settings.about')}
            description={t('settings.version')}
            onPress={() => {}}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="delete"
            title={t('settings.clearCache')}
            description={t('settings.clearCacheDesc')}
            onPress={handleClearCache}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionContent}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>{t('settings.logout')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>BourseX © 2023</Text>
        <Text style={styles.footerText}>{t('settings.allRightsReserved')}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginTop: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: 'white',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  lastSettingItem: {
    paddingBottom: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 72,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});

export default SettingsScreen;
