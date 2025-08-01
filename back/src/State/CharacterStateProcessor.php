<?php

namespace App\State;

use Sqids\Sqids;
use App\Entity\Character;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Bundle\SecurityBundle\Security;

class CharacterStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security,
        private Sqids $sqids
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Character
    {
        if (!$data instanceof Character) {
            return $data;
        }

        $method = $context['request']?->getMethod();
        $user = $this->security->getUser();

        if ($method === 'POST') {
            $data->setOwner($user);
            $this->entityManager->persist($data);
            $this->entityManager->flush();

            $hashId = $this->sqids->encode([$data->getId()]);
            $data->setHashId($hashId);

            $this->entityManager->flush();
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
