from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from datetime import datetime
from .models import Customer, Product, Subscription
from .serializers import CustomerSerializer, ProductSerializer, SubscriptionSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    def list(self, request):
        customer_id = request.query_params.get("customerId")
        product_name = request.query_params.get("productName")

        if customer_id and product_name:
            queryset = Subscription.objects.filter(
                CustomerID = customer_id,
                ProductName = product_name
            )
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception = True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def patch(self, request, *args, **kwargs):
        customer_id = request.data.get('customerId')
        product_name = request.data.get('productName')
        end_date_str = request.data.get('endDate')

        try:
            subscription = Subscription.objects.get(CustomerID=customer_id, ProductName=product_name)
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            
            subscription.SubscriptionEndDate = end_date
            subscription.save()

            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Subscription.DoesNotExist:
            return Response({
                "error": "Subscription not found"
            }, status=status.HTTP_404_NOT_FOUND)