"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useSignUpStore from "@/stores/signup.store"
import "./sign-up.css"
import { postUserData } from "@/utils/api"

export function PhoneVerification() {
  const router = useRouter()
  const { setPhoneNumber } = useSignUpStore();
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("US (+1)")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setPhoneNumber(phone)
  
    try {
      const response = await postUserData("/auth/send-verification", { phoneNumber: phone });
  
      if (response?.status === 200) {
        router.push("/verify-code");
      } else {
        console.error("Verification failed:", response);
      }
    } catch (error) {
      console.error("Error sending verification:", error);
    }
  };
  return (
    <div className="w-full items-center flex justify-center p-6">
      <div className="mt-16 w-[40vw] rounded-3xl p-8"
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
        <div style={{ border: "2px solid rgb(0,102,255)",  background:"rgb(23, 37, 54)" }} className="p-10 rounded-3xl">

          <h1 className="text-3xl font-bold text-white mb-4">Verify your phone number</h1>
          <p className="text-white mt-10 mb-8">Enter your phone number to receive a verification code</p>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
                  Phone number
                </label>
                <div className="flex gap-2 mt-5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-[#1f2937] h-[50px] border-[#374151] text-white hover:bg-[#2d3748] flex items-center gap-2 w-[250px]"
                      >
                        <img src="/svg/Salvador.png" className="mr-2 h-5 w-10" />
                        <span className="truncate">Salvador (+503)</span>
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[250px]">
                      <DropdownMenuItem onSelect={() => setCountryCode("Salvador (+503)")}>
                        <img src="/svg/Salvador.png" className="mr-2 h-5 w-10" /> Salvador (+503)
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setCountryCode("UK (+44)")}>
                        <img src="/svg/Salvador.png" className="mr-2 h-5 w-10" /> UK (+44)
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setCountryCode("CA (+1)")}>
                        <img src="/svg/Salvador.png" className="mr-2 h-5 w-10" /> CA (+1)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(000) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="flex-1 bg-[#1f2937] h-[50px] border-[#374151] text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#2563eb] h-[60px] hover:bg-blue-700 text-white flex items-center justify-between"
              >
                <div className="items-center justify-center">
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
        </div>

      </div>
    </div>
  )
}

