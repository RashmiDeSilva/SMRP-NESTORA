import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';
import OwnerDashboardScreen from './src/screens/OwnerDashboardScreen';
import AddBoardingScreen from './src/screens/AddBoardingScreen';
import StudentDashboardScreen from './src/screens/StudentDashboardScreen';
import { loginApi } from './src/services/authService';
import { addBoardingApi, getBoardingsApi, deleteBoardingApi, updateBoardingApi } from './src/services/boardingService';
import { getAllBoardingsApi } from './src/services/studentService';


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

  // Fetch boardings when current user changes
  useEffect(() => {
    if (currentUser && currentUser.email) {
      if (currentUser.role === 'Boarding Owner') {
        loadOwnerBoardings();
      } else {
        loadAllBoardings();
      }
    }
  }, [currentUser]);

  const loadOwnerBoardings = async () => {
    const ownerEmail = currentUser ? currentUser.email : '';
    if (!ownerEmail) return;
    console.log(`Loading boardings for owner: ${ownerEmail}`);
    const result = await getBoardingsApi(ownerEmail);
    if (result.success) {
      setBoardings(result.boardings);
    } else {
      console.log('Failed to fetch owner boardings:', result.message);
    }
  };

  const loadAllBoardings = async () => {
    console.log('Loading all boardings for student...');
    const result = await getAllBoardingsApi();
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
            const user = result.user;
            setCurrentUser(user);

            // Role-based navigation
            if (user?.role === 'Boarding Owner') {
              setCurrentScreen('owner_dashboard');
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
          setCurrentScreen('login');
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
          setCurrentScreen('login');
        }}
        onAddBoarding={() => {
          setEditingBoarding(null);
          setCurrentScreen('add_boarding');
        }}
        onDeleteBoarding={async (id) => {
          const result = await deleteBoardingApi(id);
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
          if (editingBoarding) {
            console.log('Updating boarding with ID:', editingBoarding._id);
            result = await updateBoardingApi(editingBoarding._id, boardingDataWithOwner);
          } else {
            console.log('Adding new boarding');
            result = await addBoardingApi(boardingDataWithOwner);
          }

          if (result.success) {
            alert(editingBoarding ? 'Boarding place updated successfully!' : 'New boarding place added successfully!');
            setEditingBoarding(null);
            // Refresh list
            await loadOwnerBoardings();
            setCurrentScreen('owner_dashboard');
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