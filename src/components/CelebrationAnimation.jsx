import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, CheckCircle } from 'lucide-react';

/**
 * 保存成功庆祝动画组件
 * 包含烟花效果、星星、心形等情感化元素
 */
const CelebrationAnimation = ({ show, onComplete, message = '日记保存成功！' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!show) {
      setParticles([]);
      return;
    }

    // 创建烟花粒子
    const createParticles = () => {
      const newParticles = [];
      const colors = ['#D4A574', '#FFB84D', '#FF8C42', '#FF6B9D', '#C8A882'];
      
      for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const velocity = 3 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        newParticles.push({
          id: i,
          angle,
          velocity,
          color,
          size: Math.random() * 6 + 4,
        });
      }
      
      setParticles(newParticles);
    };

    createParticles();

    // 1.5秒后完成动画
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[10000] flex items-center justify-center">
          {/* 中心图标和文字 */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 0.4, ease: 'easeOut' },
                scale: { duration: 0.4, ease: 'easeOut' }
              }}
              className="mb-4 flex justify-center"
            >
              <CheckCircle className="w-20 h-20 text-[#D4A574]" strokeWidth={2} />
            </motion.div>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-[#2C2C2C] font-['Noto_Serif_SC']"
            >
              {message}
            </motion.p>
          </motion.div>

          {/* 烟花粒子效果 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: 0, 
                  y: 0,
                  scale: 1,
                  opacity: 1
                }}
                animate={{
                  x: Math.cos(particle.angle) * particle.velocity * 100,
                  y: Math.sin(particle.angle) * particle.velocity * 100,
                  scale: 0,
                  opacity: 0
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  width: particle.size,
                  height: particle.size,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`
                }}
              />
            ))}
          </div>

          {/* 星星装饰 */}
          {[...Array(12)].map((_, i) => {
            const angle = (Math.PI * 2 * i) / 12;
            const radius = 150;
            return (
              <motion.div
                key={`star-${i}`}
                initial={{ 
                  x: 0, 
                  y: 0,
                  scale: 0,
                  rotate: 0
                }}
                animate={{
                  x: Math.cos(angle) * radius,
                  y: Math.sin(angle) * radius,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.05,
                  ease: 'easeOut'
                }}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-12px',
                  marginTop: '-12px'
                }}
              >
                <Star 
                  className="w-6 h-6 text-[#FFB84D]" 
                  fill="#FFB84D"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(255, 184, 77, 0.8))'
                  }}
                />
              </motion.div>
            );
          })}

          {/* 心形飘落效果 */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`heart-${i}`}
              initial={{ 
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
                y: window.innerHeight / 2,
                scale: 0,
                rotate: 0
              }}
              animate={{
                y: window.innerHeight + 100,
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 400,
                scale: [0, 1, 0.8],
                rotate: 360,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.2,
                delay: i * 0.1,
                ease: 'easeOut'
              }}
              className="absolute"
            >
              <Heart 
                className="w-8 h-8 text-[#FF6B9D]" 
                fill="#FF6B9D"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(255, 107, 157, 0.6))'
                }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationAnimation;

