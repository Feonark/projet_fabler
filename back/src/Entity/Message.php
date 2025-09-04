<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use App\State\MessageStateProcessor;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\MessageRepository;
use ApiPlatform\Metadata\GetCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ApiResource(
    paginationEnabled: true,
    paginationClientItemsPerPage: true,
    order: ['createdAt' => 'DESC'],
    mercure: 'object.getMercureOptions()',
    normalizationContext: ['groups' => ['message:read', 'message:item:read', 'message:list:read']],
    denormalizationContext: ['groups' => ['message:create', 'message:edit']],
    operations: [
        new Get(
            normalizationContext: ['groups' => ['message:item:read']],
            security: "is_granted('MESSAGE_VIEW', object)"
        ),
        new GetCollection(
            uriTemplate: '/chats/{id}/messages',
            uriVariables: [
                'id' => new Link(
                    fromClass: Chat::class,
                    fromProperty: 'messages'
                )
            ],
            normalizationContext: ['groups' => ['message:list:read']],
        ),
        new Post(
            processor: MessageStateProcessor::class,
            validationContext: ['groups' => ['message:create']],
            normalizationContext: ['groups' => ['message:item:read']],
            denormalizationContext: ['groups' => ['message:create']],
            securityPostDenormalize: "is_granted('MESSAGE_CREATE', object)",
        ),
        new Delete(
            security: "is_granted('MESSAGE_DELETE', object)"
        )
    ]
)]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['message:read', 'message:item:read', 'message:list:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank(
        groups: ['message:create', 'message:edit']
    )]
    #[Assert\Length(
        max: 400,
        maxMessage: 'Message content cannot be longer than {{ limit }} characters.',
        groups: ['message:create', 'message:edit']
    )]
    #[Groups(['message:list:read', 'message:item:read', 'message:create', 'message:edit'])]
    private ?string $content = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['message:list:read', 'message:item:read', 'message:create'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne(inversedBy: 'usedInMessages')]
    #[ORM\JoinColumn(
        nullable: true,
        onDelete: "SET NULL"
    )]
    #[Groups(['message:list:read', 'message:item:read', 'message:create'])]
    #[ApiProperty(readableLink: true, writableLink: false)]
    private ?Character $characterAlias = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: true, onDelete: "SET NULL")]
    #[Groups(['message:list:read', 'message:item:read', 'message:create'])]
    #[ApiProperty(readableLink: true, writableLink: false)]
    private ?StoryMember $author = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['message:create'])]
    #[ApiProperty(readableLink: false, writableLink: false)]
    private ?Chat $chat = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getCharacterAlias(): ?Character
    {
        return $this->characterAlias;
    }

    public function setCharacterAlias(?Character $characterAlias): static
    {
        $this->characterAlias = $characterAlias;

        return $this;
    }

    public function getAuthor(): ?StoryMember
    {
        return $this->author;
    }

    public function setAuthor(?StoryMember $author): static
    {
        $this->author = $author;

        return $this;
    }

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(?Chat $chat): static
    {
        $this->chat = $chat;

        return $this;
    }

    public function getMercureOptions(): array
    {
        $topic = '@=iri(object.getChat()) ~ "/messages"';

        return [
            'private' => false,
            'topics' => [
                $topic,
            ],
        ];
    }
}
