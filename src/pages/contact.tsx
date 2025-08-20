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
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import type { CartItem, Product } from "@shared/schema";
import { Phone, Mail, Clock, Send, MessageSquare, User } from "lucide-react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { useState } from "react";
import { usePageMeta } from "@/hooks/usePageTitle";

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
  const { t } = useTranslation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Set page title and meta tags
  usePageMeta('contact', 'contact');

  // Fetch cart items for header
  const { data: cartItems = [] } = useQuery<(CartItem & { product: Product })[]>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

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
        title: t('contact.messagesentsuccesfully', 'Message Sent Successfully'),
        description: t('contact.thankyouforcontacting', 'Thank you for contacting us. We will get back to you within 24 hours.'),
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('contact.failedtosendmessage', 'Failed to send message. Please try again.'),
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
      title: t('contact.callus', 'Call Us'),
      details: ["+995 557 91 51 46"],
      color: "text-green-600",
    },
    {
      icon: Mail,
      title: t('contact.emailus', 'Email Us'),
      details: ["info@velfrance.ge"],
      color: "text-purple-600",
    },
    {
      icon: Clock,
      title: t('contact.businesshours', 'Business Hours'),
      details: [t('contact.mondaysunday', 'Monday - Sunday: 10AM - 7PM')],
      color: "text-orange-600",
    },
  ];

  const socialMediaInfo = [
    {
      icon: SiFacebook,
      title: t('contact.facebook', 'Facebook'),
      details: [t('contact.followonfacebook', 'Follow us for updates')],
      color: "text-blue-600",
      link: "https://www.facebook.com/velfrance",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
    },
    {
      icon: SiInstagram,
      title: t('contact.instagram', 'Instagram'),
      details: [t('contact.followoninstagram', 'See our latest collections')],
      color: "text-pink-600",
      link: "https://www.instagram.com/velfrance.ge/",
      bgColor: "bg-pink-50",
      hoverColor: "hover:bg-pink-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-white">
      <Header 
        cartItemCount={cartItemCount} 
        onCartClick={() => setIsCartOpen(true)}
      />
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        isLoading={false}
      />
      
      

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
            <h2 className="text-4xl font-bold text-navy mb-4">{t('contact.getintouch', 'Get In Touch')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('contact.multipleways', 'Multiple ways to reach us. Choose what works best for you.')}
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

          {/* Social Media Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-navy mb-2">{t('contact.followus', 'Follow Us')}</h3>
              <p className="text-gray-600">{t('contact.stayconnected', 'Stay connected on social media')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
              {socialMediaInfo.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className={`block transform transition-all duration-300 hover:scale-105 ${social.hoverColor}`}
                  data-testid={`link-${social.title.toLowerCase()}`}
                >
                  <Card className={`h-full border-0 shadow-lg ${social.bgColor} hover:shadow-xl transition-shadow duration-300`}>
                    <CardContent className="p-6 text-center">
                      <div className={`${social.color} mb-4 flex justify-center`}>
                        <social.icon className="h-10 w-10" />
                      </div>
                      <h4 className="text-lg font-semibold text-navy mb-2">{social.title}</h4>
                      {social.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                </motion.a>
              ))}
            </div>
          </motion.div>
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
                    {t('contact.sendusamessage', 'Send Us a Message')}
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
                              <FormLabel className="text-navy font-semibold">{t('contact.fullname', 'Full Name')} *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={t('contact.enteryourfullname', 'Enter your full name')}
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
                              <FormLabel className="text-navy font-semibold">{t('contact.emailaddress', 'Email Address')} *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder={t('contact.enteryouremail', 'Enter your email')}
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
                              <FormLabel className="text-navy font-semibold">{t('contact.phonenumber', 'Phone Number')}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={t('contact.enteryourphonenumber', 'Enter your phone number')}
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
                              <FormLabel className="text-navy font-semibold">{t('contact.category', 'Category')} *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-gray-300 focus:border-gold focus:ring-gold">
                                    <SelectValue placeholder={t('contact.selectcategory', 'Select category')} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">{t('contact.generalinquiry', 'General Inquiry')}</SelectItem>
                                  <SelectItem value="product">{t('contact.productquestion', 'Product Question')}</SelectItem>
                                  <SelectItem value="order">{t('contact.ordersupport', 'Order Support')}</SelectItem>
                                  <SelectItem value="shipping">{t('contact.shippingreturns', 'Shipping & Returns')}</SelectItem>
                                  <SelectItem value="partnership">{t('contact.partnership', 'Partnership')}</SelectItem>
                                  <SelectItem value="other">{t('contact.other', 'Other')}</SelectItem>
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
                            <FormLabel className="text-navy font-semibold">{t('contact.subject', 'Subject')} *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('contact.entermessagesubject', 'Enter message subject')}
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
                            <FormLabel className="text-navy font-semibold">{t('contact.message', 'Message')} *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder={t('contact.tellushowwecanhelp', 'Tell us how we can help you...')}
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
                        className="w-full bg-gradient-to-r from-gold to-deep-gold hover:from-deep-gold hover:to-gold font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 text-[#000000]"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        {contactMutation.isPending ? t('contact.sending', 'Sending...') : t('contact.sendmessage', 'Send Message')}
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
                <h3 className="text-3xl font-bold text-navy mb-6">{t('contact.whychoosevelfrance', 'Why Choose Vel France?')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/20 p-2 rounded-lg">
                     
                     
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/20 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">{t('contact.fastresponse', 'Fast Response')}</h4>
                      <p className="text-gray-600 text-sm">
                        {t('contact.respondwithin24hours', 'We respond to all inquiries within 24 hours, usually much faster.')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/20 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-navy mb-1">{t('contact.multiplechannels', 'Multiple Channels')}</h4>
                      <p className="text-gray-600 text-sm">
                        {t('contact.reachusviaphoneemail', 'Reach us via phone, email.')}
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