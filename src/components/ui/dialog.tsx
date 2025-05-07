"use client";

import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import type { ComponentPropsWithoutRef, ElementRef, HTMLAttributes } from "react";
import { forwardRef } from "react";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & { inAnimation?: boolean }
>(({ className, inAnimation = true, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 flex content-start items-center justify-center overflow-y-auto bg-black/50 pt-24 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 md:py-4",
      { "data-[state=open]:animate-in data-[state=open]:fade-in-0": inAnimation },
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseIcon?: boolean;
    inAnimation?: boolean;
  }
>(({ className, children, showCloseIcon = true, inAnimation = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay inAnimation={inAnimation}>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 m-auto grid w-full gap-4 overflow-x-hidden border bg-background p-4 shadow-lg",
          "duration-500 data-[state=closed]:animate-out data-[state=closed]:fade-out-50 data-[state=closed]:slide-out-to-bottom-[48%] md:data-[state=closed]:zoom-out-50 md:data-[state=closed]:slide-out-to-bottom-0",
          "rounded-2xl md:max-w-[611px] md:p-8",
          {
            "data-[state=open]:animate-in data-[state=open]:fade-in-50 data-[state=open]:slide-in-from-bottom-[48%] md:data-[state=open]:zoom-in-50 md:data-[state=open]:slide-in-from-top-0":
              inAnimation,
          },
          className
        )}
        {...props}
      >
        {children}
        {showCloseIcon && (
          <DialogPrimitive.Close
            data-testid="CloseModalButton"
            className="absolute right-4 top-4 rounded-lg opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground md:right-8 md:top-9"
          >
            <X className="h-5 w-5 md:h-7 md:w-7" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogOverlay>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

interface DialogTitleProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  withTruncate?: boolean;
}

const DialogTitle = forwardRef<ElementRef<typeof DialogPrimitive.Title>, DialogTitleProps>(
  ({ className, withTruncate = true, ...props }, ref) => (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("w-11/12 text-base font-semibold", { truncate: withTruncate }, className)}
      {...props}
    />
  )
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
