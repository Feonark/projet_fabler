<?php

namespace App\State;

use App\Enum\Access;
use App\Entity\StoryMember;
use App\Entity\MemberChatStatus;
use ApiPlatform\Metadata\Operation;
use Doctrine\ORM\EntityManagerInterface;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class StoryMemberStateProcessor implements ProcessorInterface
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ?StoryMember
    {
        if (!$data instanceof StoryMember) {
            return $data;
        }

        $method = $context['request']?->getMethod();

        if ($method === 'POST') {
            $story = $data->getStory();
            $user = $this->security->getUser();

            if (!$story || !$user) {
                throw new BadRequestHttpException('Le paramètre "story" ou "user" est manquant ou invalide.');
            }

            // Initialisation du statut de chat
            $memberChatStatus = new MemberChatStatus();
            $memberChatStatus
                ->setIsOnline(false)
                ->setIsWriting(false);

            $this->entityManager->persist($memberChatStatus);


            $chat = $story->getChat();

            // Hydratation du StoryMember
            $data
                ->setMemberUser($user)
                ->setIsAuthor(false)
                ->setChat($chat)
                ->setMemberChatStatus($memberChatStatus)
            ;

            switch ($story->getAccessType()) {
                case Access::OPEN:
                    $data->setIsAccepted(true);
                    break;

                case Access::ON_APPROVAL:
                    $data->setIsAccepted(false);
                    break;

                case Access::CLOSED:
                    throw new \RuntimeException('You cannot join a closed story.');
            }
        }

        if ($method === 'DELETE') {
            $story = $data->getStory();
            $story = $data->getChat();

            if ($story) {
                $story->removeMember($data);
                $this->entityManager->persist($story);
            }

            if ($chat) {
                $chat->removeMember($data);
                $this->entityManager->persist($chat);
            }

            $this->entityManager->flush();

            return null;
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
