import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, BarChart3, Code2, SlidersHorizontal } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[80vh] bg-background">
      <div className="container mx-auto px-4 pt-24">
        <div className="text-center mb-24">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Meet AI - Interviews That Adapt to You
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tune your AI interviewer by role, toughness, and tech stack. Perfect
            for college students preparing to ace their tech interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 max-w-6xl mx-auto">
          <Card className="hover:border-foreground/20 transition-colors">
            <CardHeader className="items-center">
              <Briefcase className="h-10 w-10 mb-2 text-primary" />
              <CardTitle className="text-lg font-semibold">
                Practice by Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Select a profile like &apos;Frontend&apos; or &apos;Data
                Scientist&apos; for role-specific questions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:border-foreground/20 transition-colors">
            <CardHeader className="items-center">
              <BarChart3 className="h-10 w-10 mb-2 text-primary" />
              <CardTitle className="text-lg font-semibold">
                Adjust Toughness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Choose your difficulty, from &apos;Easy&apos; for basics to
                &apos;Hard&apos; for complex scenarios.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:border-foreground/20 transition-colors">
            <CardHeader className="items-center">
              <Code2 className="h-10 w-10 mb-2 text-primary" />
              <CardTitle className="text-lg font-semibold">
                Define Tech Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Focus your interview on specific technologies like
                &apos;React&apos;, &apos;Python&apos;, or &apos;SQL&apos;.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:border-foreground/20 transition-colors">
            <CardHeader className="items-center">
              <SlidersHorizontal className="h-10 w-10 mb-2 text-primary" />
              <CardTitle className="text-lg font-semibold">
                Custom Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Tune the AI with prompts like &apos;focus on system design&apos;
                or &apos;ask behavioral questions&apos;.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
