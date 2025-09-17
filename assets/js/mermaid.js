// OneApp Mermaid 配置 - 简化版
(function() {
  'use strict';
  
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMermaid);
  } else {
    initializeMermaid();
  }
  
  function initializeMermaid() {
    // 检查Mermaid是否已加载
    if (typeof mermaid === 'undefined') {
      console.warn('Mermaid not loaded');
      return;
    }
    
    // 配置Mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      themeVariables: {
        primaryColor: '#1976d2',
        primaryTextColor: '#000000',
        primaryBorderColor: '#1976d2',
        lineColor: '#333333',
        secondaryColor: '#ffffff',
        tertiaryColor: '#ffffff'
      },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: 150,
        height: 65
      },
      gantt: {
        useMaxWidth: true
      },
      journey: {
        useMaxWidth: true
      },
      timeline: {
        useMaxWidth: true
      }
    });
    
    // 主题切换支持
    setupThemeToggle();
  }
  
  function setupThemeToggle() {
    // 监听主题变化 - 改进版本
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'data-md-color-scheme') {
          console.log('Theme changed to:', mutation.target.getAttribute('data-md-color-scheme')); // 调试信息
          reinitializeMermaid();
        }
      });
    });
    
    // 同时观察body和documentElement的属性变化
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-md-color-scheme']
    });
    
    // 额外监听系统主题偏好变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', function() {
        console.log('System theme changed'); // 调试信息
        reinitializeMermaid();
      });
    }
    
    // 监听Material主题切换按钮点击
    document.addEventListener('click', function(event) {
      if (event.target.closest('[data-md-color-accent]') || 
          event.target.closest('[data-md-color-primary]') ||
          event.target.closest('.md-header__button.md-icon')) {
        setTimeout(reinitializeMermaid, 50); // 延时确保主题已切换
      }
    });
  }
  
  function reinitializeMermaid() {
    // 检测当前主题 - 修复主题检测逻辑
    const isDark = document.body.getAttribute('data-md-color-scheme') === 'slate' ||
                   document.documentElement.getAttribute('data-md-color-scheme') === 'slate' ||
                   window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    console.log('Theme detection - isDark:', isDark); // 调试信息
    
    // 重新配置主题
    const theme = isDark ? 'dark' : 'default';
    const themeVariables = isDark ? {
      primaryColor: '#bb86fc',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#bb86fc',
      lineColor: '#ffffff',
      secondaryColor: '#1f1f1f',
      tertiaryColor: '#333333',
      background: '#0d1117',
      mainBkg: '#161b22',
      secondBkg: '#21262d'
    } : {
      primaryColor: '#1976d2',
      primaryTextColor: '#000000',
      primaryBorderColor: '#1976d2',
      lineColor: '#333333',
      secondaryColor: '#ffffff',
      tertiaryColor: '#ffffff',
      background: '#ffffff',
      mainBkg: '#ffffff',
      secondBkg: '#f6f8fa'
    };
    
    // 重新初始化Mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: theme,
      themeVariables: themeVariables,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis'
      },
      sequence: {
        useMaxWidth: true,
        wrap: true
      },
      gantt: {
        useMaxWidth: true
      }
    });
    
    // 重新渲染所有图表
    setTimeout(renderAllDiagrams, 100);
  }
  
  function renderAllDiagrams() {
    const elements = document.querySelectorAll('.mermaid, pre.mermaid');
    elements.forEach(function(element, index) {
      const code = element.textContent || element.innerText;
      if (code && code.trim()) {
        try {
          element.innerHTML = '';
          element.textContent = code.trim();
          mermaid.init(undefined, element);
        } catch (error) {
          console.error('Mermaid渲染错误:', error);
          element.innerHTML = '<div style="color: red; padding: 10px; border: 1px solid red; border-radius: 4px;">图表渲染失败: ' + error.message + '</div>';
        }
      }
    });
  }
})();