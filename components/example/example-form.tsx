"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Example form component demonstrating theme token usage
 * 
 * This component showcases:
 * - Input styling with border-input and focus:ring-ring
 * - Spacing tokens (p-md, m-lg, gap-md)
 * - Theme color tokens for buttons and backgrounds
 * - Consistent styling with theme system
 */
export function ExampleForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
        <CardDescription>
          Example form using theme tokens for consistent styling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-foreground block"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-sm">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground block"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-sm">
            <label
              htmlFor="message"
              className="text-sm font-medium text-foreground block"
            >
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={4}
              className="w-full px-md py-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary resize-none"
              placeholder="Enter your message"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => setFormData({ name: "", email: "", message: "" })}
            >
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary-focus active:bg-primary-active"
            >
              Submit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

