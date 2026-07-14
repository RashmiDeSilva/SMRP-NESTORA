import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import OwnerDashboardScreen from './src/screens/OwnerDashboardScreen';
import AddBoardingScreen from './src/screens/AddBoardingScreen';
import StudentDashboardScreen from './src/screens/StudentDashboardScreen';
import InternDashboardScreen from './src/screens/InternDashboardScreen';
import EmployeeDashboardScreen from './src/screens/EmployeeDashboardScreen';
import BoardingDetailsScreen from './src/screens/BoardingDetailsScreen';
import { loginApi, toggleSavedBoardingApi, getSavedBoardingsApi } from './src/services/authService';
import { addBoardingApi, getBoardingsApi, deleteBoardingApi, updateBoardingApi } from './src/services/boardingService';
import { getAllBoardingsApi } from './src/services/studentService';
import { createBookingApi, getBookingsApi, updateBookingStatusApi } from './src/services/bookingService';


export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}


function AppContent() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [registeredUser, setRegisteredUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [boardings, setBoardings] = useState([]);
  const [allBoardings, setAllBoardings] = useState([]);
  const [editingBoarding, setEditingBoarding] = useState(null);
  const [selectedBoarding, setSelectedBoarding] = useState(null);
  const [savedBoardingIds, setSavedBoardingIds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [studentActiveFilter, setStudentActiveFilter] = useState('all');

  const toggleSaveBoarding = async (id) => {
    const email = currentUser ? currentUser.email : '';
    const token = currentUser ? currentUser.token : null;
    
    // Optimistic UI toggle updates
    setSavedBoardingIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });

    if (email) {
      const result = await toggleSavedBoardingApi(id, token, email);
      if (result.success) {
        // Normalize ObjectId objects to plain strings so .includes() works
        const normalized = (result.savedBoardingIds || []).map((oid) =>
          typeof oid === 'object' ? oid.toString() : oid
        );
        setSavedBoardingIds(normalized);
      }
    }
  };

  // Fetch boardings, bookings, and saved items when current user changes
  useEffect(() => {
    if (currentUser && currentUser.email) {
      if (currentUser.role === 'Boarding Owner') {
        loadOwnerBoardings();
        loadBookings();
      } else {
        loadAllBoardings();
        loadBookings();
        loadSavedBoardings();
      }
    }
  }, [currentUser]);

  const loadSavedBoardings = async () => {
    const email = currentUser ? currentUser.email : '';
    if (!email) return;
    console.log(`Loading saved boardings for: ${email}`);
    const token = currentUser ? currentUser.token : null;
    const result = await getSavedBoardingsApi(token, email);
    if (result.success) {
      // Normalize ObjectId objects to plain strings so .includes() works
      const normalized = (result.savedBoardingIds || []).map((id) =>
        typeof id === 'object' ? id.toString() : id
      );
      setSavedBoardingIds(normalized);
    } else {
      console.log('Failed to fetch saved boardings');
    }
  };

  const loadBookings = async () => {
    const email = currentUser ? currentUser.email : '';
    if (!email) return;
    console.log(`Loading bookings for: ${email}`);
    const token = currentUser ? currentUser.token : null;
    const result = await getBookingsApi(token, email);
    if (result.success) {
      setBookings(result.bookings);
    } else {
      console.log('Failed to fetch bookings:', result.message);
    }
  };

  const loadOwnerBoardings = async () => {
    const ownerEmail = currentUser ? currentUser.email : '';
    if (!ownerEmail) return;
    console.log(`Loading boardings for owner: ${ownerEmail}`);
    const token = currentUser ? currentUser.token : null;
    const result = await getBoardingsApi(ownerEmail, token);
    if (result.success) {
      setBoardings(result.boardings);
    } else {
      console.log('Failed to fetch owner boardings:', result.message);
    }
  };

  const loadAllBoardings = async () => {
    console.log('Loading all boardings for student...');
    const token = currentUser ? currentUser.token : null;
    const result = await getAllBoardingsApi(token);
    if (result.success) {
      setAllBoardings(result.boardings);
    } else {
      console.log('Failed to fetch all boardings:', result.message);
    }
  };

  if (currentScreen === 'splash') {
    return (
      <SplashScreen
        onFinishLoading={() => setCurrentScreen('login')}
      />
    );
  }


  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onSignIn={async (email, password) => {
          const result = await loginApi(email, password, registeredUser);

          if (result.success) {
            const messageSource = result.source === 'database'
              ? 'Authenticated by MongoDB database'
              : 'Authenticated by local state database';

            alert(`Logged in successfully! (${messageSource})`);
            const user = { ...result.user, token: result.token };
            setCurrentUser(user);

            // Seed saved boardings from login response immediately
            if (result.user?.savedBoardingIds) {
              setSavedBoardingIds(
                result.user.savedBoardingIds.map((id) =>
                  typeof id === 'object' ? id.toString() : id
                )
              );
            }

            // Role-based navigation
            if (user?.role === 'Boarding Owner') {
              setCurrentScreen('owner_dashboard');
            } else if (user?.role === 'Intern') {
              setCurrentScreen('intern_dashboard');
            } else if (user?.role === 'Employee') {
              setCurrentScreen('employee_dashboard');
            } else {
              setCurrentScreen('student_dashboard');
            }

          } else {
            alert(`Login failed: ${result.message}`);
          }
        }}

        onGoToSignUp={() => setCurrentScreen('signup')}
      />
    );
  }


  if (currentScreen === 'signup') {
    return (
      <SignUpScreen
        onBack={() => setCurrentScreen('login')}

        onSignUpSuccess={(userData) => {
          setRegisteredUser(userData);
          setCurrentScreen('login');
        }}
      />
    );
  }


  if (currentScreen === 'student_dashboard') {
    return (
      <StudentDashboardScreen
        currentUser={currentUser}
        boardings={allBoardings}
        onLogout={() => {
          setCurrentUser(null);
          setAllBoardings([]);
          setBookings([]);
          setCurrentScreen('login');
        }}
        onViewBoarding={(boarding) => {
          setSelectedBoarding(boarding);
          setCurrentScreen('boarding_details');
        }}
        savedBoardingIds={savedBoardingIds}
        bookings={bookings}
        activeFilter={studentActiveFilter}
        setActiveFilter={setStudentActiveFilter}
      />
    );
  }

  if (currentScreen === 'intern_dashboard') {
    return (
      <InternDashboardScreen
        currentUser={currentUser}
        boardings={allBoardings}
        onLogout={() => {
          setCurrentUser(null);
          setAllBoardings([]);
          setBookings([]);
          setCurrentScreen('login');
        }}
        onViewBoarding={(boarding) => {
          setSelectedBoarding(boarding);
          setCurrentScreen('boarding_details');
        }}
        savedBoardingIds={savedBoardingIds}
        bookings={bookings}
        activeFilter={studentActiveFilter}
        setActiveFilter={setStudentActiveFilter}
      />
    );
  }

  if (currentScreen === 'employee_dashboard') {
    return (
      <EmployeeDashboardScreen
        currentUser={currentUser}
        boardings={allBoardings}
        onLogout={() => {
          setCurrentUser(null);
          setAllBoardings([]);
          setBookings([]);
          setCurrentScreen('login');
        }}
        onViewBoarding={(boarding) => {
          setSelectedBoarding(boarding);
          setCurrentScreen('boarding_details');
        }}
        savedBoardingIds={savedBoardingIds}
        bookings={bookings}
        activeFilter={studentActiveFilter}
        setActiveFilter={setStudentActiveFilter}
      />
    );
  }

  if (currentScreen === 'boarding_details') {
    return (
      <BoardingDetailsScreen
        boarding={selectedBoarding}
        onBack={() => {
          setSelectedBoarding(null);
          if (currentUser?.role === 'Employee') {
            setCurrentScreen('employee_dashboard');
          } else if (currentUser?.role === 'Intern') {
            setCurrentScreen('intern_dashboard');
          } else if (currentUser?.role === 'Boarding Owner') {
            setCurrentScreen('owner_dashboard');
          } else {
            setCurrentScreen('student_dashboard');
          }
        }}
        isSaved={selectedBoarding ? savedBoardingIds.includes(selectedBoarding._id) : false}
        onToggleSave={toggleSaveBoarding}
        onBook={async (message) => {
          const token = currentUser ? currentUser.token : null;
          const email = currentUser ? currentUser.email : null;
          console.log(`[App.js onBook] boardingId=${selectedBoarding?._id} email=${email} token=${token ? 'present' : 'missing'}`);
          
          if (!selectedBoarding?._id) {
            alert('No boarding selected.');
            return;
          }

          const result = await createBookingApi(
            { boardingId: selectedBoarding._id, message },
            token,
            email
          );
          console.log('[App.js onBook] result:', JSON.stringify(result));
          
          if (result.success) {
            alert('Booking inquiry sent successfully!');
            await loadBookings();
            setStudentActiveFilter('bookings');
            setSelectedBoarding(null);
            
            if (currentUser?.role === 'Employee') {
              setCurrentScreen('employee_dashboard');
            } else if (currentUser?.role === 'Intern') {
              setCurrentScreen('intern_dashboard');
            } else if (currentUser?.role === 'Boarding Owner') {
              setCurrentScreen('owner_dashboard');
            } else {
              setCurrentScreen('student_dashboard');
            }
          } else {
            alert(`Booking failed: ${result.message || 'Unknown error'}`);
          }
        }}
      />
    );
  }

  if (currentScreen === 'owner_dashboard') {
    return (
      <OwnerDashboardScreen
        currentUser={currentUser}
        boardings={boardings}
        onLogout={() => {
          setCurrentUser(null);
          setBoardings([]);
          setBookings([]);
          setCurrentScreen('login');
        }}
        onAddBoarding={() => {
          setEditingBoarding(null);
          setCurrentScreen('add_boarding');
        }}
        onDeleteBoarding={async (id) => {
          const token = currentUser ? currentUser.token : null;
          const result = await deleteBoardingApi(id, token);
          if (result.success) {
            alert('Boarding place deleted successfully!');
            await loadOwnerBoardings();
          } else {
            alert('Failed to delete boarding place.');
          }
        }}
        onEditBoarding={(boarding) => {
          setEditingBoarding(boarding);
          setCurrentScreen('add_boarding');
        }}
        bookings={bookings}
        onConfirmBooking={async (bookingId) => {
          const token = currentUser ? currentUser.token : null;
          const email = currentUser ? currentUser.email : '';
          const result = await updateBookingStatusApi(bookingId, 'confirmed', token, email);
          if (result.success) {
            alert('Booking request confirmed!');
            await loadBookings();
          } else {
            alert('Failed to confirm booking.');
          }
        }}
        onRejectBooking={async (bookingId) => {
          const token = currentUser ? currentUser.token : null;
          const email = currentUser ? currentUser.email : '';
          const result = await updateBookingStatusApi(bookingId, 'rejected', token, email);
          if (result.success) {
            alert('Booking request declined.');
            await loadBookings();
          } else {
            alert('Failed to decline booking.');
          }
        }}
      />
    );
  }


  if (currentScreen === 'add_boarding') {
    return (
      <AddBoardingScreen
        initialData={editingBoarding}
        onBack={() => {
          setEditingBoarding(null);
          setCurrentScreen('owner_dashboard');
        }}
        onSubmit={async (data) => {
          console.log('Boarding submission:', data);
          const ownerEmail = currentUser ? currentUser.email : 'unknown_owner';
          const boardingDataWithOwner = {
            ...data,
            owner: ownerEmail,
          };

          let result;
          const token = currentUser ? currentUser.token : null;
          if (editingBoarding) {
            console.log('Updating boarding with ID:', editingBoarding._id);
            result = await updateBoardingApi(editingBoarding._id, boardingDataWithOwner, token);
          } else {
            console.log('Adding new boarding');
            result = await addBoardingApi(boardingDataWithOwner, token);
          }

          if (result.success) {
            // Instantly transition back to the dashboard and reset editing states
            setCurrentScreen('owner_dashboard');
            setEditingBoarding(null);

            // Reload the owner's boardings asynchronously in the background
            loadOwnerBoardings();

            // Notify the user in a non-blocking alert
            const msg = editingBoarding 
              ? 'Boarding place updated successfully!' 
              : 'New boarding place added successfully!';
            setTimeout(() => alert(msg), 50);
          } else {
            alert(`Failed to save boarding: ${result.message}`);
          }
        }}
      />
    );
  }


  return (
    <HomeScreen
      onReset={() => setCurrentScreen('splash')}
    />
  );
}