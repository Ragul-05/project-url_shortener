package com.example.backend.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Before("execution(* com.example.backend.controller..*(..)) || execution(* com.example.backend.service..*(..))")
    public void logBefore(JoinPoint joinPoint) {
        log.info("Invoking {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
    }

    @AfterThrowing(
            pointcut = "execution(* com.example.backend..*(..))",
            throwing = "exception"
    )
    public void logException(JoinPoint joinPoint, Exception exception) {
        log.error(
                "Exception in {}.{}: {}",
                joinPoint.getSignature().getDeclaringTypeName(),
                joinPoint.getSignature().getName(),
                exception.getMessage()
        );
    }
}
