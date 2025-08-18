import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type Language = 'fr' | 'mg';

interface Translations {
  [key: string]: any;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Translations> = {
  fr: {
    common: {
      success: 'Succès',
      error: 'Erreur', 
      loading: 'Chargement...',
      retry: 'Réessayer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Sauvegarder',
      back: 'Retour',
      next: 'Suivant',
      finish: 'Terminer',
      edit: 'Modifier',
      delete: 'Supprimer',
      add: 'Ajouter',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      refresh: 'Actualiser',
      close: 'Fermer',
      ok: 'OK',
      yes: 'Oui',
      no: 'Non',
    },
    portfolio: {
      title: 'Portefeuille',
      totalValue: 'Valeur Totale',
      todayChange: 'Variation du Jour',
      holdings: 'Positions',
      performance: 'Performance',
      allocation: 'Répartition',
      noHoldings: 'Aucune position',
      value: 'Valeur',
      change: 'Variation',
      quantity: 'Quantité',
      averagePrice: 'Prix Moyen',
      currentPrice: 'Prix Actuel',
      totalReturn: 'Rendement Total',
      dayChange: 'Variation Journalière',
      weekChange: 'Variation Hebdomadaire',
      monthChange: 'Variation Mensuelle',
      yearChange: 'Variation Annuelle',
    },
    trading: {
      title: 'Trading',
      buy: 'Acheter',
      sell: 'Vendre',
      price: 'Prix',
      quantity: 'Quantité',
      total: 'Total',
      balance: 'Solde',
      available: 'Disponible',
      orderBook: 'Carnet d\'Ordres',
      recentTrades: 'Transactions Récentes',
      placeOrder: 'Passer Ordre',
      marketOrder: 'Ordre de Marché',
      limitOrder: 'Ordre Limité',
      stopOrder: 'Ordre Stop',
      orderPlaced: 'Ordre Passé',
      orderCancelled: 'Ordre Annulé',
      insufficientFunds: 'Fonds Insuffisants',
      invalidQuantity: 'Quantité Invalide',
      invalidPrice: 'Prix Invalide',
    },
    dashboard: {
      title: 'Tableau de Bord',
      welcomeBack: 'Bon Retour',
      portfolioValue: 'Valeur du Portefeuille',
      todayGainLoss: 'Gain/Perte du Jour',
      weeklyPerformance: 'Performance Hebdomadaire',
      monthlyPerformance: 'Performance Mensuelle',
      topGainers: 'Meilleurs Gains',
      topLosers: 'Plus Grosses Pertes',
      recentActivity: 'Activité Récente',
      marketSummary: 'Résumé du Marché',
      quickActions: 'Actions Rapides',
      viewPortfolio: 'Voir Portefeuille',
      startTrading: 'Commencer Trading',
      viewNews: 'Voir Actualités',
      checkNotifications: 'Voir Notifications',
      level: 'Niveau',
      xp: 'XP',
      nextLevel: 'Niveau Suivant',
      rank: 'Rang',
      badges: 'Badges',
      missions: 'Missions',
      achievements: 'Réussites',
      leaderboard: 'Classement',
      progress: 'Progrès',
      rewards: 'Récompenses',
      points: 'Points',
      streak: 'Série',
      dailyBonus: 'Bonus Quotidien',
      weeklyChallenge: 'Défi Hebdomadaire',
      monthlyGoal: 'Objectif Mensuel',
      positions: 'Positions',
    },
    settings: {
      title: 'Paramètres',
      account: 'Compte',
      profile: 'Profil',
      editProfile: 'Modifier le Profil',
      changePassword: 'Changer le Mot de Passe',
      notifications: 'Notifications',
      pushNotifications: 'Notifications Push',
      emailNotifications: 'Notifications Email',
      smsNotifications: 'Notifications SMS',
      language: 'Langue',
      currency: 'Devise',
      theme: 'Thème',
      darkMode: 'Mode Sombre',
      privacy: 'Confidentialité',
      security: 'Sécurité',
      twoFactor: 'Authentification à Deux Facteurs',
      backup: 'Sauvegarde',
      support: 'Support',
      helpCenter: 'Centre d\'Aide',
      contactSupport: 'Contacter le Support',
      faq: 'FAQ',
      about: 'À Propos',
      version: 'Version',
      legal: 'Légal',
      termsOfService: 'Conditions d\'Utilisation',
      privacyPolicy: 'Politique de Confidentialité',
      logout: 'Déconnexion',
      logoutConfirm: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      cancel: 'Annuler',
      preferences: 'Préférences',
      clearCache: 'Vider le Cache',
      exportData: 'Exporter les Données',
      deleteAccount: 'Supprimer le Compte',
    },
    login: {
      title: 'Connexion',
      welcomeTo: 'Bienvenue sur BourseX',
      signInToContinue: 'Connectez-vous pour continuer',
      email: 'Email',
      password: 'Mot de Passe',
      enterEmail: 'Entrez votre email',
      enterPassword: 'Entrez votre mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      signIn: 'Se Connecter',
      or: 'OU',
      google: 'Google',
      facebook: 'Facebook',
      dontHaveAccount: 'Vous n\'avez pas de compte ? ',
      signUp: 'S\'inscrire',
      pleaseEnterEmailPassword: 'Veuillez entrer votre email et mot de passe',
      invalidCredentials: 'Identifiants invalides',
      loginSuccessful: 'Connexion réussie',
    },
    auth: {
      tab: 'Connexion',
    },
    news: {
      title: 'Actualités',
      general: 'Général',
      business: 'Business',
      technology: 'Technologie',
      markets: 'Marchés',
      latest: 'Dernières',
      trending: 'Tendances',
      bookmarks: 'Favoris',
      readMore: 'Lire Plus',
      shareArticle: 'Partager l\'Article',
      saveArticle: 'Sauvegarder l\'Article',
      noNews: 'Aucune actualité disponible',
      loadMore: 'Charger Plus',
      refresh: 'Actualiser',
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Tout Marquer comme Lu',
      clear: 'Effacer',
      noNotifications: 'Aucune notification',
      priceAlert: 'Alerte de Prix',
      orderFilled: 'Ordre Exécuté',
      newsUpdate: 'Mise à Jour Actualités',
      achievement: 'Réussite',
      reminder: 'Rappel',
      security: 'Sécurité',
      system: 'Système',
      marketing: 'Marketing',
    },
    search: {
      title: 'Recherche',
      placeholder: 'Rechercher des actions...',
      recentSearches: 'Recherches Récentes',
      popularStocks: 'Actions Populaires',
      suggestions: 'Suggestions',
      noResults: 'Aucun résultat trouvé',
      clearHistory: 'Effacer l\'Historique',
      addToWatchlist: 'Ajouter à la Liste de Suivi',
      removeFromWatchlist: 'Retirer de la Liste de Suivi',
    },
    transactions: {
      title: 'Transactions',
      history: 'Historique',
      pending: 'En Attente',
      completed: 'Terminées',
      cancelled: 'Annulées',
      failed: 'Échouées',
      all: 'Toutes',
      buy: 'Achat',
      sell: 'Vente',
      dividend: 'Dividende',
      fee: 'Frais',
      deposit: 'Dépôt',
      withdrawal: 'Retrait',
      date: 'Date',
      type: 'Type',
      amount: 'Montant',
      status: 'Statut',
      reference: 'Référence',
      details: 'Détails',
      filter: 'Filtrer',
      export: 'Exporter',
      noTransactions: 'Aucune transaction',
    },
    error: {
      general: 'Une erreur s\'est produite',
      network: 'Erreur de réseau',
      server: 'Erreur serveur',
      unauthorized: 'Non autorisé',
      forbidden: 'Accès interdit',
      notFound: 'Non trouvé',
      timeout: 'Temps d\'attente dépassé',
      invalidData: 'Données invalides',
      failedToLoad: 'Échec du chargement',
      failedToSave: 'Échec de la sauvegarde',
      failedToDelete: 'Échec de la suppression',
      failedToUpdate: 'Échec de la mise à jour',
      failedToClear: 'Échec du nettoyage',
      connectionLost: 'Connexion perdue',
      tryAgain: 'Veuillez réessayer',
    },
    success: {
      saved: 'Sauvegardé avec succès',
      updated: 'Mis à jour avec succès',
      deleted: 'Supprimé avec succès',
      created: 'Créé avec succès',
      sent: 'Envoyé avec succès',
      completed: 'Terminé avec succès',
      cancelled: 'Annulé avec succès',
      confirmed: 'Confirmé avec succès',
      uploaded: 'Téléchargé avec succès',
      downloaded: 'Téléchargé avec succès',
      synchronized: 'Synchronisé avec succès',
      cacheCleared: 'Cache vidé avec succès',
      exported: 'Exporté avec succès',
      imported: 'Importé avec succès',
      backed_up: 'Sauvegardé avec succès',
      restored: 'Restauré avec succès',
    },
  },
  mg: {
    common: {
      success: 'Fahombiazana',
      error: 'Hadisoana',
      loading: 'Mamakafaka...',
      retry: 'Avereno',
      cancel: 'Aoka',
      confirm: 'Hamafisy',
      save: 'Tehiry',
      back: 'Hiverina',
      next: 'Manaraka',
      finish: 'Vita',
      edit: 'Ovaina',
      delete: 'Fafao',
      add: 'Ampidirina',
      search: 'Tadiavo',
      filter: 'Sivana',
      sort: 'Alamino',
      refresh: 'Vaozina',
      close: 'Hidio',
      ok: 'Eka',
      yes: 'Eny',
      no: 'Tsia',
    },
    // Add more Malagasy translations as needed
    portfolio: {
      title: 'Tahiry',
      totalValue: 'Sanda Totaly',
      todayChange: 'Fiovan\'ny Andro',
      holdings: 'Fihazonana',
      noHoldings: 'Tsy misy fihazonana',
    },
    dashboard: {
      title: 'Tabilao Fandrindrana',
      welcomeBack: 'Tongasoa Indray',
      portfolioValue: 'Sandan\'ny Tahiry',
    },
    settings: {
      title: 'Fandrindrana',
      language: 'Fiteny',
      logout: 'Hiala',
      logoutConfirm: 'Tena te hiala ve ianao?',
      cancel: 'Aoka',
    },
    login: {
      title: 'Fidirana',
      welcomeTo: 'Tongasoa eto amin\'ny BourseX',
      signInToContinue: 'Midira aloha',
      email: 'Email',
      password: 'Teny Miafina',
      enterEmail: 'Ampidiro ny email-nao',
      enterPassword: 'Ampidiro ny teny miafina',
      forgotPassword: 'Hadino ny teny miafina?',
      signIn: 'Hiditra',
      or: 'NA',
      google: 'Google',
      facebook: 'Facebook', 
      dontHaveAccount: 'Tsy manana account? ',
      signUp: 'Hisoratra Anarana',
      pleaseEnterEmailPassword: 'Ampidiro ny email sy teny miafina',
      invalidCredentials: 'Tsy mety ny login',
      loginSuccessful: 'Nahomby ny fidirana',
    },
    auth: {
      tab: 'Fidirana',
    },
    news: {
      title: 'Vaovao',
      general: 'Ankapobeny',
      business: 'Fandraharahana',
      technology: 'Teknolojia',
      markets: 'Tsena',
    },
    error: {
      failedToLoad: 'Tsy voakatra',
      failedToClear: 'Tsy voafafa',
    },
    success: {
      cacheCleared: 'Voafafa ny cache',
    },
  },
};

// Provider component
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fr'); // Default to French

  // Load saved language on app start
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('app_language');
        if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'mg')) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLanguage();
  }, []);

  // Change language and save to storage
  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('app_language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Translation function
  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let translation: any = translations[language];
    
    for (const k of keys) {
      translation = translation?.[k];
    }
    
    if (typeof translation === 'string') {
      // Replace parameters if provided
      if (params) {
        return Object.entries(params).reduce(
          (str, [param, value]) => str.replace(`{{${param}}}`, value),
          translation
        );
      }
      return translation;
    }
    
    // Fallback to French if key not found in current language
    if (language !== 'fr') {
      let fallbackTranslation: any = translations.fr;
      for (const k of keys) {
        fallbackTranslation = fallbackTranslation?.[k];
      }
      if (typeof fallbackTranslation === 'string') {
        if (params) {
          return Object.entries(params).reduce(
            (str, [param, value]) => str.replace(`{{${param}}}`, value),
            fallbackTranslation
          );
        }
        return fallbackTranslation;
      }
    }
    
    // Return key if no translation found
    return key;
  };

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// Hook to use the context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

export default I18nContext;
