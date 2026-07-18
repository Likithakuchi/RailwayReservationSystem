import json
import sqlite3
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from . import db

def error_response(message, status=400):
    return JsonResponse({"error": message}, status=status)

def success_response(data, message="Success", status=200):
    response_data = {"message": message}
    if data is not None:
        response_data.update(data)
    return JsonResponse(response_data, status=status)

# ----------------- MODULE 1: PASSENGER MANAGEMENT -----------------

@csrf_exempt
def add_passenger_view(request):
    if request.method != 'POST':
        return error_response("Only POST method is allowed", 405)
    try:
        data = json.loads(request.body)
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        gender = data.get('gender')
        age = data.get('age')
        address = data.get('address')
        password = data.get('password')

        if not all([full_name, email, phone, gender, age, address, password]):
            return error_response("All fields are required")

        passenger_id = db.add_passenger(full_name, email, phone, gender, int(age), address, password)
        return success_response({"passenger_id": passenger_id}, "Passenger registered successfully", 201)
    except sqlite3.IntegrityError:
        return error_response("Email already registered")
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def get_passengers_view(request):
    if request.method != 'GET':
        return error_response("Only GET method is allowed", 405)
    try:
        passengers = db.get_passengers()
        return JsonResponse(passengers, safe=False)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def update_passenger_view(request, passenger_id):
    if request.method != 'PUT':
        return error_response("Only PUT method is allowed", 405)
    try:
        data = json.loads(request.body)
        full_name = data.get('full_name')
        email = data.get('email')
        phone = data.get('phone')
        gender = data.get('gender')
        age = data.get('age')
        address = data.get('address')
        password = data.get('password')

        if not all([full_name, email, phone, gender, age, address, password]):
            return error_response("All fields are required")

        updated = db.update_passenger(passenger_id, full_name, email, phone, gender, int(age), address, password)
        if updated:
            return success_response(None, "Passenger updated successfully")
        else:
            return error_response("Passenger not found", 404)
    except sqlite3.IntegrityError:
        return error_response("Email already exists for another passenger")
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def delete_passenger_view(request, passenger_id):
    if request.method != 'DELETE':
        return error_response("Only DELETE method is allowed", 405)
    try:
        deleted = db.delete_passenger(passenger_id)
        if deleted:
            return success_response(None, "Passenger deleted successfully")
        else:
            return error_response("Passenger not found", 404)
    except Exception as e:
        return error_response(str(e))


# ----------------- MODULE 2: TRAIN MANAGEMENT -----------------

@csrf_exempt
def add_train_view(request):
    if request.method != 'POST':
        return error_response("Only POST method is allowed", 405)
    try:
        data = json.loads(request.body)
        train_name = data.get('train_name')
        train_number = data.get('train_number')
        train_type = data.get('train_type')
        total_seats = data.get('total_seats')
        source = data.get('source')
        destination = data.get('destination')

        if not all([train_name, train_number, train_type, total_seats, source, destination]):
            return error_response("All fields are required")

        train_id = db.add_train(train_name, train_number, train_type, int(total_seats), source, destination)
        return success_response({"train_id": train_id}, "Train added successfully", 201)
    except sqlite3.IntegrityError:
        return error_response("Train number already exists")
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def get_trains_view(request):
    if request.method != 'GET':
        return error_response("Only GET method is allowed", 405)
    try:
        trains = db.get_trains()
        return JsonResponse(trains, safe=False)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def update_train_view(request, train_id):
    if request.method != 'PUT':
        return error_response("Only PUT method is allowed", 405)
    try:
        data = json.loads(request.body)
        train_name = data.get('train_name')
        train_number = data.get('train_number')
        train_type = data.get('train_type')
        total_seats = data.get('total_seats')
        source = data.get('source')
        destination = data.get('destination')

        if not all([train_name, train_number, train_type, total_seats, source, destination]):
            return error_response("All fields are required")

        updated = db.update_train(train_id, train_name, train_number, train_type, int(total_seats), source, destination)
        if updated:
            return success_response(None, "Train updated successfully")
        else:
            return error_response("Train not found", 404)
    except sqlite3.IntegrityError:
        return error_response("Train number already exists for another train")
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def delete_train_view(request, train_id):
    if request.method != 'DELETE':
        return error_response("Only DELETE method is allowed", 405)
    try:
        deleted = db.delete_train(train_id)
        if deleted:
            return success_response(None, "Train deleted successfully")
        else:
            return error_response("Train not found", 404)
    except Exception as e:
        return error_response(str(e))


# ----------------- MODULE 3: ROUTE & SCHEDULE MANAGEMENT -----------------

@csrf_exempt
def add_schedule_view(request):
    if request.method != 'POST':
        return error_response("Only POST method is allowed", 405)
    try:
        data = json.loads(request.body)
        train_name = data.get('train_name')
        source = data.get('source')
        destination = data.get('destination')
        departure_date = data.get('departure_date')
        departure_time = data.get('departure_time')
        arrival_date = data.get('arrival_date')
        arrival_time = data.get('arrival_time')
        fare = data.get('fare')

        if not all([train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare]):
            return error_response("All fields are required")

        schedule_id = db.add_schedule(train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, float(fare))
        return success_response({"schedule_id": schedule_id}, "Schedule added successfully", 201)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def get_schedules_view(request):
    if request.method != 'GET':
        return error_response("Only GET method is allowed", 405)
    try:
        schedules = db.get_schedules()
        return JsonResponse(schedules, safe=False)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def update_schedule_view(request, schedule_id):
    if request.method != 'PUT':
        return error_response("Only PUT method is allowed", 405)
    try:
        data = json.loads(request.body)
        train_name = data.get('train_name')
        source = data.get('source')
        destination = data.get('destination')
        departure_date = data.get('departure_date')
        departure_time = data.get('departure_time')
        arrival_date = data.get('arrival_date')
        arrival_time = data.get('arrival_time')
        fare = data.get('fare')

        if not all([train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, fare]):
            return error_response("All fields are required")

        updated = db.update_schedule(schedule_id, train_name, source, destination, departure_date, departure_time, arrival_date, arrival_time, float(fare))
        if updated:
            return success_response(None, "Schedule updated successfully")
        else:
            return error_response("Schedule not found", 404)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def delete_schedule_view(request, schedule_id):
    if request.method != 'DELETE':
        return error_response("Only DELETE method is allowed", 405)
    try:
        deleted = db.delete_schedule(schedule_id)
        if deleted:
            return success_response(None, "Schedule deleted successfully")
        else:
            return error_response("Schedule not found", 404)
    except Exception as e:
        return error_response(str(e))


# ----------------- MODULE 4: TICKET RESERVATION MANAGEMENT -----------------

@csrf_exempt
def add_booking_view(request):
    if request.method != 'POST':
        return error_response("Only POST method is allowed", 405)
    try:
        data = json.loads(request.body)
        passenger_name = data.get('passenger_name')
        train_name = data.get('train_name')
        journey_date = data.get('journey_date')
        source = data.get('source')
        destination = data.get('destination')
        coach_type = data.get('coach_type')
        seat_number = data.get('seat_number')
        total_fare = data.get('total_fare')
        booking_status = data.get('booking_status')

        if not all([passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status]):
            return error_response("All fields are required")

        booking_id = db.add_booking(passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, float(total_fare), booking_status)
        return success_response({"booking_id": booking_id}, "Booking placed successfully", 201)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def get_bookings_view(request):
    if request.method != 'GET':
        return error_response("Only GET method is allowed", 405)
    try:
        bookings = db.get_bookings()
        return JsonResponse(bookings, safe=False)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def update_booking_view(request, booking_id):
    if request.method != 'PUT':
        return error_response("Only PUT method is allowed", 405)
    try:
        data = json.loads(request.body)
        passenger_name = data.get('passenger_name')
        train_name = data.get('train_name')
        journey_date = data.get('journey_date')
        source = data.get('source')
        destination = data.get('destination')
        coach_type = data.get('coach_type')
        seat_number = data.get('seat_number')
        total_fare = data.get('total_fare')
        booking_status = data.get('booking_status')

        if not all([passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, total_fare, booking_status]):
            return error_response("All fields are required")

        updated = db.update_booking(booking_id, passenger_name, train_name, journey_date, source, destination, coach_type, seat_number, float(total_fare), booking_status)
        if updated:
            return success_response(None, "Booking updated successfully")
        else:
            return error_response("Booking not found", 404)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def delete_booking_view(request, booking_id):
    if request.method != 'DELETE':
        return error_response("Only DELETE method is allowed", 405)
    try:
        deleted = db.delete_booking(booking_id)
        if deleted:
            return success_response(None, "Booking deleted successfully")
        else:
            return error_response("Booking not found", 404)
    except Exception as e:
        return error_response(str(e))


# ----------------- MODULE 5: PAYMENT MANAGEMENT -----------------

@csrf_exempt
def add_payment_view(request):
    if request.method != 'POST':
        return error_response("Only POST method is allowed", 405)
    try:
        data = json.loads(request.body)
        booking_id = data.get('booking_id')
        passenger_name = data.get('passenger_name')
        amount = data.get('amount')
        payment_method = data.get('payment_method')
        payment_status = data.get('payment_status')
        transaction_id = data.get('transaction_id')
        payment_date = data.get('payment_date')

        if not all([booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date]):
            return error_response("All fields are required")

        payment_id = db.add_payment(int(booking_id), passenger_name, float(amount), payment_method, payment_status, transaction_id, payment_date)
        return success_response({"payment_id": payment_id}, "Payment processed successfully", 201)
    except sqlite3.IntegrityError:
        return error_response("Transaction ID already exists")
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def get_payments_view(request):
    if request.method != 'GET':
        return error_response("Only GET method is allowed", 405)
    try:
        payments = db.get_payments()
        return JsonResponse(payments, safe=False)
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def update_payment_view(request, payment_id):
    if request.method != 'PUT':
        return error_response("Only PUT method is allowed", 405)
    try:
        data = json.loads(request.body)
        booking_id = data.get('booking_id')
        passenger_name = data.get('passenger_name')
        amount = data.get('amount')
        payment_method = data.get('payment_method')
        payment_status = data.get('payment_status')
        transaction_id = data.get('transaction_id')
        payment_date = data.get('payment_date')

        if not all([booking_id, passenger_name, amount, payment_method, payment_status, transaction_id, payment_date]):
            return error_response("All fields are required")

        updated = db.update_payment(payment_id, int(booking_id), passenger_name, float(amount), payment_method, payment_status, transaction_id, payment_date)
        if updated:
            return success_response(None, "Payment updated successfully")
        else:
            return error_response("Payment record not found", 404)
    except sqlite3.IntegrityError:
        return error_response("Transaction ID already exists for another payment")
    except Exception as e:
        return error_response(str(e))

@csrf_exempt
def delete_payment_view(request, payment_id):
    if request.method != 'DELETE':
        return error_response("Only DELETE method is allowed", 405)
    try:
        deleted = db.delete_payment(payment_id)
        if deleted:
            return success_response(None, "Payment record deleted successfully")
        else:
            return error_response("Payment record not found", 404)
    except Exception as e:
        return error_response(str(e))
