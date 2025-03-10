import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast"; // Corrected import statement
import { SidebarNav as Sidebar } from "@/components/ui/sidebar";
import JsBarcode from "jsbarcode";
import { Printer, Plus } from "lucide-react";

// ... rest of the barcodes.tsx file ...