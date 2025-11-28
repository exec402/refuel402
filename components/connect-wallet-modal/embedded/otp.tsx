"use client";

import React, { useState } from "react";

import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { useVerifyEmailOTP } from "@coinbase/cdp-hooks";
import { useConnectWalletModalStore } from "@/stores/connectWalletModal";
import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

import { cn } from "@/lib/utils";

interface Props {
  flowId: string;
  handleReset: () => void;
}

export const EmbeddedWalletOTP: React.FC<Props> = ({ flowId, handleReset }) => {
  const [otp, setOtp] = useState("");

  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { setOpen } = useConnectWalletModalStore();

  const {
    mutateAsync: verifyOTP,
    isPending: isVerifyingOTP,
    error: verifyOTPError,
    isSuccess: verifyOTPSuccess,
  } = useMutation({
    mutationFn: async ({ flowId, otp }: { flowId: string; otp: string }) => {
      return verifyEmailOTP({
        flowId,
        otp,
      });
    },
    onSuccess: () => {
      toast.success("Sign in success");
      setOpen(false);
    },
    onError: () => {
      toast.error("Invalid OTP");
    },
  });

  const otpGroupProps = (isSuccess: boolean) => {
    return {
      className: cn(
        "flex-1 rounded-md",
        isSuccess && "shadow-[0_0_8px_var(--color-green-600)]"
      ),
    };
  };

  const otpSlotProps = (isSuccess: boolean) => {
    return {
      className: cn("h-10 flex-1 text-xl", isSuccess && "border-green-600"),
    };
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="otp">OTP Code</Label>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          containerClassName="w-full rounded-full"
        >
          <InputOTPGroup {...otpGroupProps(verifyOTPSuccess)}>
            <InputOTPSlot index={0} {...otpSlotProps(verifyOTPSuccess)} />
            <InputOTPSlot index={1} {...otpSlotProps(verifyOTPSuccess)} />
            <InputOTPSlot index={2} {...otpSlotProps(verifyOTPSuccess)} />
          </InputOTPGroup>
          <InputOTPSeparator
            className={cn(verifyOTPSuccess && "text-green-600")}
          />
          <InputOTPGroup {...otpGroupProps(verifyOTPSuccess)}>
            <InputOTPSlot index={3} {...otpSlotProps(verifyOTPSuccess)} />
            <InputOTPSlot index={4} {...otpSlotProps(verifyOTPSuccess)} />
            <InputOTPSlot index={5} {...otpSlotProps(verifyOTPSuccess)} />
          </InputOTPGroup>
        </InputOTP>
        {verifyOTPError ? (
          <p className="text-muted-foreground text-xs">
            {verifyOTPError.message}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Please check the OTP in your email
          </p>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <Button
          onClick={() => verifyOTP({ flowId, otp })}
          disabled={isVerifyingOTP || verifyOTPSuccess || otp.length !== 6}
          size="lg"
        >
          {(isVerifyingOTP || verifyOTPSuccess) && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Sign in
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="lg"
          disabled={isVerifyingOTP}
        >
          Use a different email
        </Button>
      </div>
    </div>
  );
};
