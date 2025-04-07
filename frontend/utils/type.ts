export interface ScrollState {
    scrollIsVisible: boolean;
    setIsVisible: (scrollIsVisible: boolean) => void;
}

export interface SignUpState {
    isSignUpComplete: boolean;
    completeSignUp: () => void;
    username: string;
    setUsername: (username: string) => void;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    phoneNumber: string;
    setPhoneNumber: (phoneNumber: string) => void;
    verificationCode: string;
    setVerificationCode: (verificationCode: string) => void;
}

