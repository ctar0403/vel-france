import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, Mail, Clock, Send, MessageSquare, User } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      category: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Call Us",
      details: ["+995 557 91 51 46"],
      color: "text-green-600",
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@velfrance.ge"],
      color: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Sunday: 10AM - 7PM"],
      color: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white">
      <Header />
      
      

      {/* Contact Information Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-navy mb-4">Get In Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Multiple ways to reach us. Choose what works best for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className={`${info.color} mb-4 flex justify-center`}>
                      <info.icon className="h-12 w-12" />
                    </div>
                    <h3 className="text-xl font-semibold text-navy mb-3">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm leading-relaxed">
                        {detail}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-navy to-deep-navy text-white rounded-t-lg">
                  <CardTitle className="tracking-tight text-2xl font-bold flex items-center gap-3 text-[#000000]">
                    <MessageSquare className="h-6 w-6" />
                    Send Us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-navy font-semibold">Full Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter your full name"
                                  className="border-gray-300 focus:border-gold focus:ring-gold"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-navy font-semibold">Email Address *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="Enter your email"
                                  className="border-gray-300 focus:border-gold focus:ring-gold"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-navy font-semibold">Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter your phone number"
                                  className="border-gray-300 focus:border-gold focus:ring-gold"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-navy font-semibold">Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-gray-300 focus:border-gold focus:ring-gold">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">General Inquiry</SelectItem>
                                  <SelectItem value="product">Product Question</SelectItem>
                                  <SelectItem value="order">Order Support</SelectItem>
                                  <SelectItem value="shipping">Shipping & Returns</SelectItem>
                                  <SelectItem value="partnership">Partnership</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-navy font-semibold">Subject *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter message subject"
                                className="border-gray-300 focus:border-gold focus:ring-gold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-navy font-semibold">Message *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Tell us how we can help you..."
                                rows={5}
                                className="border-gray-300 focus:border-gold focus:ring-gold resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={contactMutation.isPending}
                        className="w-full bg-gradient-to-r from-gold to-deep-gold hover:from-deep-gold hover:to-gold text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        {contactMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-3xl font-bold text-navy mb-6">Why Choose Vel France?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/20 p-2 rounded-lg">
                      <User className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Expert Consultation</h4>
                      <p className="text-gray-600 text-sm">
                        Our fragrance experts help you find the perfect scent for every occasion.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/20 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Fast Response</h4>
                      <p className="text-gray-600 text-sm">
                        We respond to all inquiries within 24 hours, usually much faster.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/20 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">Multiple Channels</h4>
                      <p className="text-gray-600 text-sm">
                        Reach us via phone, email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}