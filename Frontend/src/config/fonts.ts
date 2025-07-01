// Configuration des polices de l'application
export const fontConfig = {
  Poppins: {
    400: 'Poppins-Regular',
    500: 'Poppins-Medium',
    600: 'Poppins-SemiBold',
    700: 'Poppins-Bold',
  },
};

// Chargement sécurisé des polices
export const loadFonts = async () => {
  try {
    // Ces imports seront gérés par expo-font
    const [
      regular,
      medium,
      semiBold,
      bold,
    ] = await Promise.all([
      require('../../assets/fonts/Poppins-Regular.ttf'),
      require('../../assets/fonts/Poppins-Medium.ttf'),
      require('../../assets/fonts/Poppins-SemiBold.ttf'),
      require('../../assets/fonts/Poppins-Bold.ttf'),
    ]);

    return {
      'Poppins-Regular': regular,
      'Poppins-Medium': medium,
      'Poppins-SemiBold': semiBold,
      'Poppins-Bold': bold,
    };
  } catch (error) {
    console.warn('Erreur lors du chargement des polices :', error);
    return {};
  }
};

export default {
  fontConfig,
  loadFonts,
};
