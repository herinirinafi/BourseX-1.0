import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { GlassCard } from './GlassCard';
import { useTheme } from '../../config/theme';
import { formatCurrency } from '../../config/currency';

interface PriceChartProps {
  data: number[];
  title: string;
  currentPrice: number;
  change24h: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  title,
  currentPrice,
  change24h
}) => {
  const theme = useTheme();

  // Créer un graphique en barres simple
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  return (
    <GlassCard style={styles.container} padding="lg">
      <View style={styles.header}>
        <Typography variant="h4" color="text" weight="600">
          {title}
        </Typography>
        <View style={styles.priceInfo}>
          <Typography variant="h3" color="text" weight="700">
            {formatCurrency(currentPrice)}
          </Typography>
          <Typography 
            variant="body2" 
            color={change24h >= 0 ? 'success' : 'error'}
            weight="600"
          >
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </Typography>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.slice(-12).map((value, index) => {
            const height = ((value - minValue) / range) * 60 + 10;
            const barColor = change24h >= 0 ? theme.colors.success : theme.colors.error;
            
            return (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    height,
                    backgroundColor: `${barColor}66`,
                    borderTopColor: barColor,
                  }
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.timeFrames}>
        {['1H', '24H', '7D', '1M'].map((timeFrame, index) => (
          <View key={timeFrame} style={[
            styles.timeFrameButton,
            index === 1 && styles.timeFrameButtonActive
          ]}>
            <Typography 
              variant="caption" 
              color={index === 1 ? 'primary' : 'textSecondary'} 
              weight={index === 1 ? '600' : '400'}
            >
              {timeFrame}
            </Typography>
          </View>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
    paddingHorizontal: 10,
  },
  chartBar: {
    flex: 1,
    borderTopWidth: 2,
    borderRadius: 1,
    minHeight: 10,
  },
  timeFrames: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.1)',
  },
  timeFrameButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeFrameButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
});
