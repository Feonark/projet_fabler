<?php

namespace App\State;

use App\Entity\User;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if (!$data instanceof User) {
            return $data;
        }

        if ($data->getPlainPassword()) {
            $hashedPassword = $this->passwordHasher->hashPassword($data, $data->getPlainPassword());
            $data->setPassword($hashedPassword);
            $data->setPlainPassword(null);
        }

        $method = $context['request']?->getMethod();

        if ($method === 'POST') {
            $data->setRoles(['ROLE_USER']);
            $data->setIsOnline(false);
            $data->setCreatedAt(new \DateTimeImmutable());
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
