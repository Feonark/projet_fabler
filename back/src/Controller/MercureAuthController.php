<?php

namespace App\Controller;

use App\Entity\StoryMember;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MercureAuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
        private UrlGeneratorInterface $urlGenerator
    ) {}

    #[Route('/api/mercure-auth', name: 'mercure_auth', methods: ['POST'])]
    public function __invoke(): Response
    {
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $storyMember = $this->em->getRepository(StoryMember::class)->findOneBy([
            'memberUser' => $user,
            'isAccepted' => true,
        ]);

        if (!$storyMember || !$storyMember->getChat()) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $chat = $storyMember->getChat();
        $secret = $_ENV['MERCURE_JWT_SECRET'];

        $topics = [
            $this->urlGenerator->generate('api_chats_messages_get_collection', ['id' => $chat->getId()], UrlGeneratorInterface::ABSOLUTE_URL),
            $this->urlGenerator->generate('api_chats_get_item', ['id' => $chat->getId()], UrlGeneratorInterface::ABSOLUTE_URL),
        ];

        foreach ($chat->getMembers() as $member) {
            if ($member->getMemberChatStatus()) {
                $topics[] = $this->urlGenerator->generate('api_member_chat_statuses_get_item', [
                    'id' => $member->getMemberChatStatus()->getId()
                ], UrlGeneratorInterface::ABSOLUTE_URL);
            }
        }

        $header  = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = $this->base64UrlEncode(json_encode([
            'mercure' => ['subscribe' => $topics],
            'exp' => (new \DateTime('+2 hours'))->getTimestamp(),
        ]));
        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', $header . '.' . $payload, $secret, true)
        );
        $jwt = $header . '.' . $payload . '.' . $signature;

        $cookie = Cookie::create('mercureAuthorization', $jwt)
            ->withDomain('.fabler.fr')
            ->withSecure(true)
            ->withHttpOnly(true)
            ->withSameSite('none')
            ->withPath('/')
            ->withExpires(new \DateTime('+2 hours'));

        $response = new Response(null, Response::HTTP_NO_CONTENT);
        $response->headers->setCookie($cookie);

        return $response;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
