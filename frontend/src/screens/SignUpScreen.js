import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';

import { Feather, Ionicons } from '@expo/vector-icons';
import { signUpApi } from '../services/authService';

export default function SignUpScreen({ onBack, onSignUpSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState('Student');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const roles = [
    { id: 'Student', label: 'Student', icon: 'book' },
    { id: 'Intern', label: 'Intern', icon: 'award' },
    { id: 'Employee', label: 'Employee', icon: 'briefcase' },
    { id: 'Boarding Owner', label: 'Boarding Owner', icon: 'home' },
  ];

  const handleSignUp = async () => {
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword
    ) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      alert('You must agree to the Terms & Conditions');
      return;
    }

    const result = await signUpApi({ fullName, email, phoneNumber, password, role: selectedRole });
    
    if (result.success) {
      alert(`Account created successfully as a ${selectedRole}! ${result.source === 'database' ? '(Saved to MongoDB)' : '(Saved to Local DB)'}`);
      if (onSignUpSuccess) {
        onSignUpSuccess({ email, password, role: selectedRole });
      }
    } else {
      alert(`Sign up failed: ${result.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require('../../assets/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea}>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >

            {/* Header */}
            <View style={styles.header}>

              <TouchableOpacity
                onPress={onBack}
                style={styles.backButton}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#0F172A"
                />
              </TouchableOpacity>


              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>
                  Create Account
                </Text>

                <Text style={styles.headerSubtitle}>
                  Join Nestora today
                </Text>
              </View>

              <View style={styles.headerSpacer} />

            </View>


            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >

              {/* Full Name */}
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                setValue={setFullName}
              />


              {/* Email */}
              <InputField
                label="Email"
                placeholder="Enter your email"
                value={email}
                setValue={setEmail}
                keyboardType="email-address"
              />


              {/* Phone */}
              <InputField
                label="Phone Number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                setValue={setPhoneNumber}
                keyboardType="phone-pad"
              />


              {/* Password */}
              <PasswordField
                label="Password"
                placeholder="Create a password"
                value={password}
                setValue={setPassword}
                visible={showPassword}
                setVisible={setShowPassword}
              />


              {/* Confirm Password */}
              <PasswordField
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                setValue={setConfirmPassword}
                visible={showConfirmPassword}
                setVisible={setShowConfirmPassword}
              />



              {/* Role Selection */}

              <View style={styles.roleGroup}>

                <Text style={styles.label}>
                  I am a
                </Text>


                <View style={styles.rolesRow}>

                  {roles.map((role)=>{

                    const selected =
                      selectedRole === role.id;


                    return (

                      <TouchableOpacity
                        key={role.id}
                        style={[
                          styles.roleCard,
                          selected && styles.selectedRoleCard
                        ]}
                        onPress={()=>setSelectedRole(role.id)}
                      >

                        <Feather
                          name={role.icon}
                          size={22}
                          color={
                            selected
                            ? '#6D28D9'
                            : '#64748B'
                          }
                        />


                        <Text
                          style={[
                            styles.roleText,
                            selected &&
                            styles.selectedRoleText
                          ]}
                        >
                          {role.label}
                        </Text>


                      </TouchableOpacity>

                    );

                  })}

                </View>

              </View>



              {/* Terms */}

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={()=>setAgreeTerms(!agreeTerms)}
              >

                <View
                  style={[
                    styles.checkbox,
                    agreeTerms &&
                    styles.checkedCheckbox
                  ]}
                >

                  {
                    agreeTerms &&
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color="white"
                    />
                  }

                </View>


                <Text style={styles.checkboxText}>
                  I agree to the 
                  <Text style={styles.boldText}>
                    {' '}Terms & Conditions
                  </Text>
                  {' '}and
                  <Text style={styles.boldText}>
                    {' '}Privacy Policy
                  </Text>
                </Text>


              </TouchableOpacity>



              {/* Button */}

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
              >

                <Text style={styles.signUpButtonText}>
                  Sign Up
                </Text>

              </TouchableOpacity>


            </ScrollView>


          </KeyboardAvoidingView>

        </SafeAreaView>

      </ImageBackground>

    </View>
  );
}




// Reusable Input Component

function InputField({
  label,
  placeholder,
  value,
  setValue,
  keyboardType
}) {

  return (

    <View style={styles.inputGroup}>

      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.inputWrapper}>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
        />

      </View>

    </View>

  );

}



// Password Component

function PasswordField({
  label,
  placeholder,
  value,
  setValue,
  visible,
  setVisible
}) {

  return (

    <View style={styles.inputGroup}>

      <Text style={styles.label}>
        {label}
      </Text>


      <View style={styles.inputWrapper}>

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={!visible}
          value={value}
          onChangeText={setValue}
        />


        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={()=>setVisible(!visible)}
        >

          <Feather
            name={visible ? 'eye':'eye-off'}
            size={20}
            color="#64748B"
          />

        </TouchableOpacity>


      </View>


    </View>

  );

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
    fontWeight: '500',
  },
  headerSpacer: {
    width: 40, // Keeps header title perfectly centered
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  roleGroup: {
    marginBottom: 20,
  },
  rolesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  roleCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  selectedRoleCard: {
    backgroundColor: '#F5F3FF',
    borderColor: '#6D28D9',
    borderWidth: 1.5,
  },
  roleIcon: {
    marginBottom: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  selectedRoleText: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkedCheckbox: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
  },
  checkboxText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    color: '#6D28D9',
    fontWeight: '700',
  },
  signUpButton: {
    backgroundColor: '#6D28D9',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
