import React from 'react';

interface ServiceCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    delay?: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    title,
    description,
    icon,
    delay = 0,
}) => {
    return (
        <div
            className="service-card"
            style={{ animationDelay: `${delay}ms` }}
            data-aos="fade-up"
        >
            <div className="service-card-icon">{icon}</div>
            <h3 className="service-card-title">{title}</h3>
            <p className="service-card-description">{description}</p>
        </div>
    );
};

export default ServiceCard;
