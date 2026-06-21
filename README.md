```md
# StayBook Frontend

Frontend application for StayBook, a hotel room booking platform with two user flows: staff and guest.

## Staff Flow

### Login

Staff users log in with their staff account.

Example:

| Role  | Email          | Password    |
| ----- | -------------- | ----------- |
| STAFF | staff@test.com | password123 |

### Manage Rooms

After logging in, staff users can:

- View rooms
- Create new rooms
- Edit room information
- Deactivate rooms

Room information includes name, description, price, floor, photos, amenities, and active status.

### Manage Reservations

Staff users can:

- View guest reservations
- Check reservation details
- Cancel reservations manually

## Guest Flow

### Login

Guest users log in with their guest account.

Example:

| Role  | Email          | Password    |
| ----- | -------------- | ----------- |
| GUEST | guest@test.com | password123 |

### Browse and Book Rooms

After logging in, guest users can:

- Browse available rooms
- Filter rooms by check-in date, check-out date, and number of guests
- View room details
- Create a reservation

Only active and available rooms are shown.

### Manage Reservations

Guest users can:

- View their reservations
- Edit an upcoming reservation
- Cancel an upcoming reservation when allowed

Each reservation shows the room, dates, total price, and status.

## Notes

- Staff and guest users use the same login page.
- The available options depend on the logged-in user's role.
- Staff users manage rooms and reservations.
- Guest users book rooms and manage their own reservations.
```
