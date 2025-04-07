"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import QRCodeGenerator from "./qr-generate"
import "./sign-up.css"

export function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/verify-phone")
  }

  return (
    <div className="flex w-full mx-auto">
      <div className="w-full items-center flex justify-center md:w-1/2 p-6">
        <div className="max-w-[793px] max-h-[850px] mt-16 rounded-3xl p-8"
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
              <h1 className="text-3xl font-bold text-white">Create your account</h1>
            </div>
            <p className="text-white text-xl mt-4 mb-6">Access the TOCENBANK how to offer with a single account</p>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#05172C] border-[#374151] h-[50px] text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2563eb] h-[60px] hover:bg-blue-700 text-white flex items-center justify-between"
                >
                  <div className="items-center">
                    Continue
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
              </div>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1F2F419E] text-gray-400">OR</span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Button
                variant="outline"
                className="w-full bg-[#05172C] border-[#374151] h-[50px] text-white hover:bg-[#2d3748] flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="ml-2">Sign In With Google</span>
                </div>
                <img src="/svg/google.PNG" className="h-[35px]" />
              </Button>

              <Button
                variant="outline"
                className="w-full bg-[#05172C] border-[#374151] h-[50px] text-white hover:bg-[#2d3748] flex items-center justify-between"
              >
                <div className="flex items-center">
                  <span className="ml-2">Sign In With Apple</span>
                </div>
                <img src="/svg/macos.svg" className="h-[35px]" />
              </Button>
            </div>

            <p className="mt-6 text-xs text-white text-center">
              By creating an account you certify that you are above the age of 18 and agree to the privacy policy
            </p>
          </div>

        </div>
      </div>

      <div className="hidden md:flex md:w-1/2 flex-col mt-20 items-center p-6">
        <QRCodeGenerator value={"window.location.toString()"} />
        <p className="text-sm text-white mt-10 mb-2">Scan QR code for Login</p>
        <h2 className="text-2xl font-bold text-white mb-6">Secure 2FA Login !</h2>
        <div className="flex items-center bg-[#181F28] rounded-full px-4 py-2">
          <Lock className="h-5 w-5 text-[#2563eb] mr-2" />
          <span className="text-[#2563eb]">https://</span>
          <span className="text-white">www.tockenobank.com</span>
        </div>
        <p className="mt-8 text-xs text-white text-center max-w-xs">
          a safe and transparent platform for investing in crypto assets, with a high level of reliability and legal
          protection.
        </p>
      </div>
    </div>
  )
}

