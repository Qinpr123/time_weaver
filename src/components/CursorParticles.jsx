import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * 鼠标跟随粒子动效组件
 * 在鼠标移动时产生跟随的粒子效果，增加情感化反馈
 */
const CursorParticles = ({ enabled = true, particleCount = 8 }) => {
  const particlesRef = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    let mouseX = 0;
    let mouseY = 0;
    let animationFrameId = null;

    const updateParticles = () => {
      particlesRef.current.forEach((particle, index) => {
        if (!particle) return;

        // 计算目标位置（鼠标位置）
        const targetX = mouseX;
        const targetY = mouseY;

        // 获取当前粒子位置
        const currentX = parseFloat(particle.style.left) || mouseX;
        const currentY = parseFloat(particle.style.top) || mouseY;

        // 缓动动画，每个粒子有不同的延迟
        const delay = index * 0.05;
        const speed = 0.15;
        
        const dx = targetX - currentX;
        const dy = targetY - currentY;

        particle.style.left = `${currentX + dx * speed}px`;
        particle.style.top = `${currentY + dy * speed}px`;
      });

      animationFrameId = requestAnimationFrame(updateParticles);
    };

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // 初始化粒子
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'cursor-particle';
        particle.style.cssText = `
          position: fixed;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 165, 116, ${0.8 - i * 0.1}) 0%, rgba(212, 165, 116, 0) 70%);
          pointer-events: none;
          z-index: 9999;
          left: ${mouseX}px;
          top: ${mouseY}px;
          transform: scale(${1 - i * 0.1});
          transition: opacity 0.3s ease;
        `;
        container.appendChild(particle);
        particlesRef.current.push(particle);
      }
    };

    // 初始化
    initParticles();
    updateParticles();

    // 监听鼠标移动
    window.addEventListener('mousemove', handleMouseMove);

    // 清理函数
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      particlesRef.current.forEach(particle => {
        if (particle && particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
      particlesRef.current = [];
    };
  }, [enabled, particleCount]);

  return <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }} />;
};

export default CursorParticles;

