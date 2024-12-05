from django.db import models

class Customer(models.Model):
    CustomerID = models.CharField(max_length=10, primary_key=True, unique=True)
    Name = models.CharField(max_length=100)
    PAN = models.CharField(max_length=10)

    class Meta:
        db_table = 'CUSTOMER'

    def __str__(self):
        return f"Name: {self.Name}"

class Product(models.Model):
    ProductName = models.CharField(max_length=50, primary_key=True, unique=True)
    Description = models.TextField()
    AnnualSubscriptionCost = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'PRODUCT'

    def __str__(self):
        return f"Name: {self.ProductName}"

class Subscription(models.Model):
    SubscriptionID = models.AutoField(primary_key=True)
    CustomerID = models.CharField(max_length=50)
    ProductName = models.CharField(max_length=50)
    SubscriptionStartDate = models.DateField()
    SubscriptionEndDate = models.DateField()
    NumberOfUsers = models.PositiveBigIntegerField()

    class Meta:
        db_table = 'SUBSCRIPTION'
        constraints = [
            models.CheckConstraint(check=models.Q(NumberOfUsers__gt=0), name='chk_number_of_users_positive'),
            models.CheckConstraint(check=models.Q(CustomerID__regex=r'^CN[0-9]{8}$'), name='chk_subs_CustomerID')
        ]

    def __str__(self):
        return f"{self.customer_id}, {self.product_name}"
