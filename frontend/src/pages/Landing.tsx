import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, MessageSquare, Key, Zap, Shield, Code } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Database AI Agent</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Your Database Meets AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your database using natural language. No complex queries, just conversation.
            Connect any database and start chatting instantly.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Try Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Natural Language Queries</h3>
            <p className="text-muted-foreground">
              Ask questions in plain English. "Get all users where age is greater than 25" - that's it.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Key className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">API Access</h3>
            <p className="text-muted-foreground">
              Generate secure API tokens to integrate the AI agent into your applications.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure & Encrypted</h3>
            <p className="text-muted-foreground">
              Your database credentials are encrypted and never exposed. Complete data privacy.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Full CRUD Operations</h3>
            <p className="text-muted-foreground">
              Create, read, update, and delete operations powered by AI understanding.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Instant Responses</h3>
            <p className="text-muted-foreground">
              Get results in seconds. The AI agent translates and executes your requests instantly.
            </p>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
              <Code className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Developer Friendly</h3>
            <p className="text-muted-foreground">
              RESTful API, comprehensive docs, and code examples to get you started fast.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your database workflow?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join developers who are already using AI to simplify their database operations.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Start Building Now</Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Database AI Agent Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
