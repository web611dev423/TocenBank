"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import useSignUpStore from "@/stores/signup.store"
import axios from "axios";
import "./sign-up.css"
import { postUserData } from "@/utils/api"

export function CodeVerification() {
  const router = useRouter()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { setVerificationCode, username, email, phoneNumber, password, verificationCode } = useSignUpStore();

  // Initialize refs array with correct length
  useEffect(() => {
    inputRefs.current = Array(code.length).fill(null)
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Focus previous input when backspace is pressed on empty input
      inputRefs.current[index - 1]?.focus()
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setVerificationCode(code.join(""));

    try {
      const response = await postUserData("auth/register", { username, password, email, phoneNumber, verificationCode });

      if (response?.status === 200) {
        router.push("/");
      } else {
        console.error("Verification failed:", response);
      }
    } catch (error) {
      console.error("Error sending verification:", error);
    }
  };

  return (
    <div className="w-full mx-auto items-center flex justify-center p-6">
      <div className="mt-16 max-w-[30vw]  rounded-3xl p-8"
        style={{
          border: " 2px solid rgb(0,102,255)",
          background: "rgb(0,102,255,0.2)"
        }}
      >
        <div className="bankName" style={
          {
            backgroundColor: "rgb(23, 37, 54)",
            width: "fit-content",
            margin: "auto",
            transform: "translate(0, 50%)",
          }}>

          <div className="flex" style={{ marginTop: "-20px" }}>
            <h1 className="text-3xl font-bold">TOCEN</h1>
            <h1 className="text-3xl font-thin">BANK</h1>
          </div>

        </div>
        <div style={{ border: "2px solid rgb(0,102,255)", background: "rgb(23, 37, 54)" }} className="p-10 rounded-3xl">
          <div className="flex justify-between gap-2">
            <h1 className="text-3xl font-bold text-white">Enter the 6-digit code</h1>

          </div>
          <p className="text-white text-sm mt-5 mb-8">This helps to keep your account secure by verifying that it's really you</p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="code-0" className="block text-sm font-medium text-white mb-3">
                  Enter Code
                </label>
                <div className="flex gap-2 justify-between">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-[50px] h-12 text-center text-white bg-[#1f2937] border-[#374151] border rounded-md focus:border-transparent"
                      required
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2563eb] h-[60px] hover:bg-blue-700 text-white flex items-center justify-between"
              >
                <div className="items-center text-base">
                  Resend Code
                </div>
                <span className="bg-blue-400/30 rounded-full p-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3.33337 8H12.6667M12.6667 8L8.00004 3.33333M12.6667 8L8.00004 12.6667"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Button>

              <div className="text-center">
                <Link href="/verify-phone" className="text-gray-400 hover:text-white text-sm">
                  Go back
                </Link>
              </div>
            </div>
          </form>

        </div>

      </div>
    </div>
  )
}

