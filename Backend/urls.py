from django.urls import path
from . import views

urlpatterns = [
    # Module 1: Passenger Management (4 APIs)
    path('passengers/add/', views.add_passenger_view, name='add_passenger'),
    path('passengers/', views.get_passengers_view, name='get_passengers'),
    path('passengers/update/<int:passenger_id>/', views.update_passenger_view, name='update_passenger'),
    path('passengers/delete/<int:passenger_id>/', views.delete_passenger_view, name='delete_passenger'),

    # Module 2: Train Management (4 APIs)
    path('trains/add/', views.add_train_view, name='add_train'),
    path('trains/', views.get_trains_view, name='get_trains'),
    path('trains/update/<int:train_id>/', views.update_train_view, name='update_train'),
    path('trains/delete/<int:train_id>/', views.delete_train_view, name='delete_train'),

    # Module 3: Route & Schedule Management (4 APIs)
    path('schedules/add/', views.add_schedule_view, name='add_schedule'),
    path('schedules/', views.get_schedules_view, name='get_schedules'),
    path('schedules/update/<int:schedule_id>/', views.update_schedule_view, name='update_schedule'),
    path('schedules/delete/<int:schedule_id>/', views.delete_schedule_view, name='delete_schedule'),

    # Module 4: Ticket Reservation Management (4 APIs)
    path('bookings/add/', views.add_booking_view, name='add_booking'),
    path('bookings/', views.get_bookings_view, name='get_bookings'),
    path('bookings/update/<int:booking_id>/', views.update_booking_view, name='update_booking'),
    path('bookings/delete/<int:booking_id>/', views.delete_booking_view, name='delete_booking'),

    # Module 5: Payment Management (4 APIs)
    path('payments/add/', views.add_payment_view, name='add_payment'),
    path('payments/', views.get_payments_view, name='get_payments'),
    path('payments/update/<int:payment_id>/', views.update_payment_view, name='update_payment'),
    path('payments/delete/<int:payment_id>/', views.delete_payment_view, name='delete_payment'),
]
