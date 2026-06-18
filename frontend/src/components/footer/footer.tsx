import { motion } from "framer-motion";

export function Footer() {
    return (
        <footer className="w-full py-20 mt-20 border-t bg-background/50">
            {/* <div className="container px-4 mx-auto text-center">
                <h2 className="text-4xl md:text-6xl lg:text-9xl font-black tracking-tight text-muted-foreground/20 select-none uppercase">
                    <div>A</div>
                    <div>Valueye</div>
                    <div>Product</div>
                </h2>
            </div> */}
            {/* The Massive Text */}
            <motion.h1
                className={`text-[23vw] md:text-[13vw] leading-[0.8] font-bold text-muted-foreground tracking-tighter text-center md:text-left select-none pointer-events-none`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 0.1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
            >
                A VALUEYE PRODUCT
            </motion.h1>
        </footer>
    );
}