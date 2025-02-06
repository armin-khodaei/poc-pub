import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface UseCaseCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  tags: string[];
  onClick: () => void;
}

export function UseCaseCard({
  title,
  description,
  icon: Icon,
  tags,
  onClick,
}: UseCaseCardProps) {
  return (
    <Card className="flex flex-col h-full bg-white border-slate-200">
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Icon className="h-5 w-5 text-slate-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-slate-900">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-sm text-slate-600 leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-2 py-0.5 text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
        >
          Create Agreement
        </Button>
      </CardFooter>
    </Card>
  );
}
