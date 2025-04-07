import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import storage from '../store';
import { SignUpState } from "../utils/type";

const useSignUpStore = create<SignUpState>()(
  persist(
    (set) => ({
      isSignUpComplete: false,
      completeSignUp: () => set({ isSignUpComplete: true }), 
      username: "",
      setUsername: (username: string) => set({ username }),
      email: "",
      setEmail: ( email: string) => set({ email }),
      password: "",
      setPassword: (password: string) => set({ password }),
      phoneNumber: "",
      setPhoneNumber: (phoneNumber: string ) => set({ phoneNumber}),
      verificationCode: "",
      setVerificationCode: (verificationCode: string) => set({ verificationCode})
    }),
    {
      name: 'signup-storage', // Unique name for storage
      storage: {
        getItem: async (key: string) => {
          const value = await storage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key: string, value: StorageValue<SignUpState>) => {
          return await storage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key: string) => {
          await storage.removeItem(key);
        }
      }
    }
  )
);

export default useSignUpStore;