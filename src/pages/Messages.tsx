
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, MessageSquare, PlusCircle, Search, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Header from "@/components/Layout/Header";
import Sidebar from "@/components/Layout/Sidebar";

// Mock data for messages
const mockConversations = [
  {
    id: 1,
    name: "John Smith",
    avatar: "",
    lastMessage: "I'll send the documents to you by tomorrow",
    timestamp: "10:45 AM",
    unread: 2,
  },
  {
    id: 2,
    name: "Bank of Canada",
    avatar: "",
    lastMessage: "The loan application has been approved",
    timestamp: "Yesterday",
    unread: 0,
  },
  {
    id: 3,
    name: "Sarah Johnson",
    avatar: "",
    lastMessage: "Can we schedule a call to discuss the property?",
    timestamp: "Monday",
    unread: 0,
  },
];

// Mock messages for a conversation
const mockMessages = [
  {
    id: 1,
    sender: "John Smith",
    content: "Hi, I have a question about my mortgage application",
    timestamp: "10:30 AM",
    isSender: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Sure, I'd be happy to help. What do you need to know?",
    timestamp: "10:32 AM",
    isSender: true,
  },
  {
    id: 3,
    sender: "John Smith",
    content: "I'm wondering if I need to provide additional documents for the application",
    timestamp: "10:35 AM",
    isSender: false,
  },
  {
    id: 4,
    sender: "You",
    content: "Yes, we'll need your latest bank statements and proof of employment. I can send you the full list of required documents.",
    timestamp: "10:40 AM",
    isSender: true,
  },
  {
    id: 5,
    sender: "John Smith",
    content: "I'll send the documents to you by tomorrow",
    timestamp: "10:45 AM",
    isSender: false,
  },
];

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [messages, setMessages] = useState(mockMessages);
  
  const filteredConversations = mockConversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessageText.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      content: newMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSender: true,
    };
    
    setMessages([...messages, newMessage]);
    setNewMessageText("");
    
    // Simulate a response after a delay
    setTimeout(() => {
      const responseMessage = {
        id: messages.length + 2,
        sender: "John Smith",
        content: "Thanks for your message. I'll get back to you shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: false,
      };
      
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const handleCreateConversation = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const recipient = formData.get("recipient") as string;
    const message = formData.get("message") as string;
    
    if (!recipient || !message) {
      toast.error("Please complete all fields");
      return;
    }
    
    toast.success("Message sent successfully");
    setIsNewConversationOpen(false);
    
    // Simulate adding a new conversation
    setSelectedConversation(1); // Select the first conversation as a demo
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-64">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Messages</h1>
              <p className="text-muted-foreground">Manage your communications</p>
            </div>
            <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
              <DialogTrigger asChild>
                <Button className="bg-law-teal hover:bg-law-teal/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Message</DialogTitle>
                  <DialogDescription>
                    Send a message to a client or team member
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateConversation}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient</Label>
                      <Select name="recipient">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contact" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="john-smith">John Smith</SelectItem>
                          <SelectItem value="bank-of-canada">Bank of Canada</SelectItem>
                          <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        name="message"
                        placeholder="Type your message here" 
                        className="min-h-[150px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewConversationOpen(false)} type="button">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-law-teal hover:bg-law-teal/90">
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle>Conversations</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsNewConversationOpen(true)}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="h-full overflow-y-auto pb-16">
                <div className="space-y-2">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-md cursor-pointer",
                          selectedConversation === conversation.id
                            ? "bg-law-teal/10 dark:bg-law-teal/20"
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {conversation.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{conversation.name}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-[180px]">
                              {conversation.lastMessage}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {conversation.timestamp}
                          </div>
                          {conversation.unread > 0 && (
                            <div className="bg-law-teal text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center mt-1 ml-auto">
                              {conversation.unread}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No conversations found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="pb-2 border-b">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mr-2 md:hidden"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <CardTitle>John Smith</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.isSender ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-3",
                              message.isSender
                                ? "bg-law-teal text-white"
                                : "bg-muted"
                            )}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className="text-xs mt-1 opacity-70">
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        className="bg-law-teal hover:bg-law-teal/90"
                        onClick={handleSendMessage}
                        disabled={!newMessageText.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Conversation Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a conversation from the list or start a new one
                  </p>
                  <Button 
                    className="bg-law-teal hover:bg-law-teal/90"
                    onClick={() => setIsNewConversationOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Start New Conversation
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
