<?php

namespace App\Entity;

use App\Enum\Access;
use App\Enum\Audience;
use App\Enum\Genre;
use App\Repository\StoryRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: StoryRepository::class)]
class Story
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 6)]
    private ?string $hashId = null;

    #[ORM\Column(length: 50)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $bannerImageUrl = null;

    #[ORM\Column]
    private ?bool $isPublic = null;

    #[ORM\Column(enumType: Genre::class)]
    private ?Genre $genreType = null;

    #[ORM\Column(enumType: Audience::class)]
    private ?Audience $audienceType = null;

    #[ORM\Column(enumType: Access::class)]
    private ?Access $accessType = null;

    /**
     * @var Collection<int, Character>
     */
    #[ORM\ManyToMany(targetEntity: Character::class, mappedBy: 'usedInStories')]
    private Collection $characters;

    #[ORM\ManyToOne(inversedBy: 'authoredStories')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $author = null;

    /**
     * @var Collection<int, StoryMember>
     */
    #[ORM\OneToMany(targetEntity: StoryMember::class, mappedBy: 'story')]
    private Collection $members;

    #[ORM\OneToOne(mappedBy: 'story', cascade: ['persist', 'remove'])]
    private ?Chat $chat = null;

    /**
     * @var Collection<int, Place>
     */
    #[ORM\OneToMany(targetEntity: Place::class, mappedBy: 'story', orphanRemoval: true)]
    private Collection $places;

    public function __construct()
    {
        $this->characters = new ArrayCollection();
        $this->members = new ArrayCollection();
        $this->places = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHashId(): ?string
    {
        return $this->hashId;
    }

    public function setHashId(string $hashId): static
    {
        $this->hashId = $hashId;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getBannerImageUrl(): ?string
    {
        return $this->bannerImageUrl;
    }

    public function setBannerImageUrl(?string $bannerImageUrl): static
    {
        $this->bannerImageUrl = $bannerImageUrl;

        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;

        return $this;
    }

    public function getGenreType(): ?Genre
    {
        return $this->genreType;
    }

    public function setGenreType(Genre $genreType): static
    {
        $this->genreType = $genreType;

        return $this;
    }

    public function getAudienceType(): ?Audience
    {
        return $this->audienceType;
    }

    public function setAudienceType(Audience $audienceType): static
    {
        $this->audienceType = $audienceType;

        return $this;
    }

    public function getAccessType(): ?Access
    {
        return $this->accessType;
    }

    public function setAccessType(Access $accessType): static
    {
        $this->accessType = $accessType;

        return $this;
    }

    /**
     * @return Collection<int, Character>
     */
    public function getCharacters(): Collection
    {
        return $this->characters;
    }

    public function addCharacter(Character $character): static
    {
        if (!$this->characters->contains($character)) {
            $this->characters->add($character);
            $character->addUsedInStory($this);
        }

        return $this;
    }

    public function removeCharacter(Character $character): static
    {
        if ($this->characters->removeElement($character)) {
            $character->removeUsedInStory($this);
        }

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return Collection<int, StoryMember>
     */
    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function addMember(StoryMember $member): static
    {
        if (!$this->members->contains($member)) {
            $this->members->add($member);
            $member->setStory($this);
        }

        return $this;
    }

    public function removeMember(StoryMember $member): static
    {
        if ($this->members->removeElement($member)) {
            // set the owning side to null (unless already changed)
            if ($member->getStory() === $this) {
                $member->setStory(null);
            }
        }

        return $this;
    }

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(Chat $chat): static
    {
        // set the owning side of the relation if necessary
        if ($chat->getStory() !== $this) {
            $chat->setStory($this);
        }

        $this->chat = $chat;

        return $this;
    }

    /**
     * @return Collection<int, Place>
     */
    public function getPlaces(): Collection
    {
        return $this->places;
    }

    public function addPlace(Place $place): static
    {
        if (!$this->places->contains($place)) {
            $this->places->add($place);
            $place->setStory($this);
        }

        return $this;
    }

    public function removePlace(Place $place): static
    {
        if ($this->places->removeElement($place)) {
            // set the owning side to null (unless already changed)
            if ($place->getStory() === $this) {
                $place->setStory(null);
            }
        }

        return $this;
    }
}
