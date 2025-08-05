<?php

namespace App\State;

use App\Entity\Message;
use App\Entity\StoryMember;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Bundle\SecurityBundle\Security;

class MessageStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Message
    {
        if (!$data instanceof Message) {
            return $data;
        }

        $method = $context['request']?->getMethod();
        $user = $this->security->getUser();

        if ($method === 'POST') {
            $chat = $data->getChat();

            if (!$chat || !$user) {
                throw new \LogicException('Chat ou utilisateur manquant.');
            }

            // Je récupère le storymember correspondant à cet utilisateur dans ce chat
            $storyMember = $this->entityManager->getRepository(StoryMember::class)
                ->findOneBy([
                    'memberUser' => $user,
                    'chat' => $chat,
                ]);

            if (!$storyMember) {
                return $data;
            }

            $data
                ->setAuthor($storyMember)
                ->setCreatedAt(new \DateTimeImmutable());
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
