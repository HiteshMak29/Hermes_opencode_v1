# FlutterFlow Implementation Guide - Jericho University Portal

This document provides the FlutterFlow concept matching, Dart models, and API Custom Actions required to recreate the Jericho University College Portal in FlutterFlow.

---

## 1. Widget Tree & Responsive Layout Structure

To match the clean, responsive layout of the React sidebar inside FlutterFlow, use the following layout tree structure:

- **Root Widget**: `Scaffold` (Set background to `#F9FAFB` - Slate Gray 50)
  - **Body**: `Row` (For desktop screens)
    - **Side Navigation (Sidebar)**: `Container` (Width: `250px`, Color: `#312E81` - Indigo 900)
      - *Visibility*: Wrap in a **Responsive Visibility** block (Only show on `Tablet` and `Desktop`).
      - *Contents*: `Column`
        - **Header**: Logo and "Jericho Uni" Title
        - **Navigation Group 1 (Student Portal)**: List of `Row` buttons (Dashboard, Admissions, Academics, Financial Aid, Advising, Housing, Medical, Library, Meal Wallet, Access Card, AI Assistant, Support Center).
        - **Navigation Group 2 (Admin Section)**: Visible only if User Role is `Faculty` or `Admin`. Wrap in a `ConditionalBuilder`. Displays Student Retention, Predictive Risk, Module Analytics, Incident Management, System Status, Source Connectivity.
        - **Footer**: Profile element (Alex Johnson).
    - **Main Content Area**: `Expanded`
      - `Column` with `NestedScrollView` or `SingleChildScrollView` (Padding: `24px` on desktop, `16px` on mobile)
        - **Mobile AppBar**: Visible only on `Mobile`. Includes Hamburger icon triggering the Scaffold's `EndDrawer` or `Drawer`.

---

## 2. Shared State & User Role

In FlutterFlow, define the following **App State** variables:

| Name | Type | Persisted | Default Value | Description |
|---|---|---|---|---|
| `currentUserRole` | String | No | `"Admin"` | Set to `"Admin"`, `"Faculty"`, or `"Student"`. |
| `selectedNav` | String | No | `"Dashboard"` | Tracks the currently active view. |

To manage student records, define an **App State (JSON or Data Type)** representing the student profile:
```json
{
  "name": "Alex Johnson",
  "studentId": "2024-8842-JU",
  "major": "Computer Science & Engineering",
  "minor": "Mathematics",
  "year": 3,
  "currentGpa": 3.82,
  "totalCredits": 92
}
```

---

## 3. Data Integration: Dart API Custom Actions

FlutterFlow handles external integrations via its **API Calls** selector or **Custom Actions** (Dart). Below are the Dart representations to communicate with the SIS, LMS, and CRM systems.

### A. SIS (Student Information Service) Custom Action

Create a **Custom Action** named `fetchSISStudentProfile` returning a `JSON` block:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<dynamic> fetchSISStudentProfile(
  String studentId,
  String apiUrl,
  String apiKey,
) async {
  if (apiUrl.isEmpty || apiKey.isEmpty) {
    return {"error": "Credentials missing"};
  }

  try {
    final response = await http.get(
      Uri.parse('$apiUrl/students/$studentId'),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body);
    } else {
      return {"error": "Failed load with status: ${response.statusCode}"};
    }
  } catch (e) {
    return {"error": "Exception occurred: $e"};
  }
}
```

### B. LMS (Learning Management System) Custom Action

Create a **Custom Action** named `fetchLMSCourses` returning a `List<JSON>`:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<List<dynamic>> fetchLMSCourses(
  String studentId,
  String apiUrl,
  String apiKey,
) async {
  if (apiUrl.isEmpty || apiKey.isEmpty) {
    return [{"error": "Credentials missing"}];
  }

  try {
    final response = await http.get(
      Uri.parse('$apiUrl/courses/$studentId'),
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      return json.decode(response.body) as List<dynamic>;
    } else {
      return [{"error": "Server error ${response.statusCode}"}];
    }
  } catch (e) {
    return [{"error": e.toString()}];
  }
}
```

---

## 4. Support Ticket Conversation State (Dart Model)

In FlutterFlow, declare a **Firestore Collection** or **Data Type** for support tickets:

### Firestore Schema Details:
- **Collection**: `support_tickets`
  - `ticketId`: String
  - `subject`: String
  - `department`: String
  - `status`: String  // e.g., 'Open', 'In Progress', 'Resolved'
  - `priority`: String
  - `studentId`: String
  - `studentName`: String
  - `createdAt`: Timestamp
  - `assignedTo`: String
  - `messages`: List of Maps (Custom Datatype: `Message`)
    - `sender`: String
    - `text`: String
    - `timestamp`: Timestamp

This data model structures ticket progression and real-time chat sync directly.
