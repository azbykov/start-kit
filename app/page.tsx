import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-display font-bold text-center mb-8">
          Youth Football Match & Player Analytics Platform
        </h1>
        <p className="text-center text-lg mb-8">
          Welcome to the MVP setup. The project is ready for development.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <Button>Primary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="secondary">Secondary Button</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
              <CardDescription>
                shadcn/ui components are configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Button and Card components are working correctly.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Styling System</CardTitle>
              <CardDescription>TailwindCSS is configured</CardDescription>
            </CardHeader>
            <CardContent>
              <p>TailwindCSS utility classes are working correctly.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

