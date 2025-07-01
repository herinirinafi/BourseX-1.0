from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Stock, StockPriceHistory
from .serializers import StockSerializer, StockPriceHistorySerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        stock = self.get_object()
        history = stock.price_history.all()[:100]  # Get last 100 price updates
        serializer = StockPriceHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_price(self, request, pk=None):
        stock = self.get_object()
        new_price = request.data.get('price')
        
        if not new_price:
            return Response(
                {"error": "Price is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_price = float(new_price)
            if new_price <= 0:
                raise ValueError("Price must be positive")
                
            # Update current price
            stock.current_price = new_price
            stock.save()
            
            # Create price history entry
            StockPriceHistory.objects.create(stock=stock, price=new_price)
            
            serializer = self.get_serializer(stock)
            return Response(serializer.data)
            
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid price format"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
